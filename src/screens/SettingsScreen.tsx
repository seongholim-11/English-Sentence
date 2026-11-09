import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, Tab } from '../components/BottomNav';
import { Txt } from '../components/Txt';
import { FONT_SCALES, GOAL_MAX, GOAL_MIN, Prefs, Progress, SPEECH_RATES, THEMES } from '../progress';
import { Reminder, applyReminder, reminderSupported, timeLabel } from '../reminder';
import { PRIVACY_URL } from '../links';
import { speak } from '../speech';
import { colors, createStyles } from '../theme';

const PRESETS = [10, 20, 30, 50, 100];
const STEP = 5;

export function SettingsScreen({
  progress,
  onSetGoal,
  onSetPrefs,
  onNavigate,
}: {
  progress: Progress;
  onSetGoal: (n: number) => void;
  onSetPrefs: (p: Partial<Prefs>) => void;
  onNavigate: (t: Tab) => void;
}) {
  const insets = useSafeAreaInsets();
  const goal = progress.goal;
  const reminder = progress.prefs.reminder;
  const [reminderNote, setReminderNote] = useState('');
  const [notices, setNotices] = useState(false);

  const changeReminder = async (next: Reminder) => {
    setReminderNote('');
    const ok = await applyReminder(next).catch(() => false);
    if (next.on && !ok) {
      onSetPrefs({ reminder: { ...next, on: false } });
      setReminderNote(reminderSupported ? '알림 권한이 꺼져 있어요. 기기 설정에서 허용해 주세요.' : '알림은 모바일 앱에서만 쓸 수 있어요.');
      return;
    }
    onSetPrefs({ reminder: next });
  };
  const shift = (min: number) => {
    const total = (reminder.hour * 60 + reminder.minute + min + 1440) % 1440;
    changeReminder({ ...reminder, hour: Math.floor(total / 60), minute: total % 60 });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.body, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 4 }}>
          <Txt size={13} weight={500} color={colors.muted}>
            나에게 맞게
          </Txt>
          <Txt size={28} weight={700} style={styles.tight}>
            설정
          </Txt>
        </View>

        <View style={styles.card}>
          <View style={{ gap: 4 }}>
            <Txt size={17} weight={600}>
              하루 목표
            </Txt>
            <Txt size={13} color={colors.muted}>
              하루에 몇 장을 볼지 정해 두면 홈에서 진행률로 보여 줘요.
            </Txt>
          </View>

          <View style={styles.stepper}>
            <Stepper label="목표 줄이기" sign="−" disabled={goal <= GOAL_MIN} onPress={() => onSetGoal(goal - STEP)} />
            <View style={{ alignItems: 'center', minWidth: 96 }}>
              <Txt size={40} weight={700} style={styles.tight} tabular>
                {String(goal)}
              </Txt>
              <Txt size={13} color={colors.muted}>
                장 / 하루
              </Txt>
            </View>
            <Stepper label="목표 늘리기" sign="+" disabled={goal >= GOAL_MAX} onPress={() => onSetGoal(goal + STEP)} />
          </View>

          <View style={styles.presets}>
            {PRESETS.map((n) => {
              const on = n === goal;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => onSetGoal(n)}
                  style={[styles.preset, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                >
                  <Txt size={14} weight={600} color={on ? colors.white : colors.ink} tabular>
                    {String(n)}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={{ gap: 4 }}>
            <Txt size={17} weight={600}>
              발음
            </Txt>
            <Txt size={13} color={colors.muted}>
              카드의 스피커 버튼과 대화문에서 읽어 주는 속도예요.
            </Txt>
          </View>
          <View style={styles.presets}>
            {SPEECH_RATES.map(({ label, rate }) => {
              const on = rate === progress.prefs.speechRate;
              return (
                <Pressable
                  key={rate}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    onSetPrefs({ speechRate: rate });
                    speak('How are you doing today?', rate);
                  }}
                  style={[styles.preset, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                >
                  <Txt size={14} weight={600} color={on ? colors.white : colors.ink}>
                    {label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.infoRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={15} weight={600}>
                자동 재생
              </Txt>
              <Txt size={13} color={colors.muted}>
                카드를 넘기면 바로 읽어 줘요
              </Txt>
            </View>
            <Switch
              accessibilityLabel="자동 재생"
              value={progress.prefs.autoSpeak}
              onValueChange={(v) => onSetPrefs({ autoSpeak: v })}
              trackColor={{ true: colors.accent, false: colors.borderStrong }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt size={17} weight={600}>
                복습 알림
              </Txt>
              <Txt size={13} color={colors.muted}>
                정한 시각에 매일 복습하라고 알려 줘요.
              </Txt>
            </View>
            <Switch
              accessibilityLabel="복습 알림"
              value={reminder.on}
              onValueChange={(v) => changeReminder({ ...reminder, on: v })}
              trackColor={{ true: colors.accent, false: colors.borderStrong }}
              thumbColor={colors.white}
            />
          </View>
          {reminder.on && (
            <View style={styles.stepper}>
              <Stepper label="30분 일찍" sign="−" disabled={false} onPress={() => shift(-30)} />
              <Txt size={26} weight={700} style={styles.tight} tabular>
                {timeLabel(reminder)}
              </Txt>
              <Stepper label="30분 늦게" sign="+" disabled={false} onPress={() => shift(30)} />
            </View>
          )}
          {reminderNote !== '' && (
            <Txt size={13} color={colors.bad}>
              {reminderNote}
            </Txt>
          )}
        </View>

        <View style={styles.card}>
          <View style={{ gap: 4 }}>
            <Txt size={17} weight={600}>
              화면
            </Txt>
            <Txt size={13} color={colors.muted}>
              테마와 글자 크기를 바꿀 수 있어요.
            </Txt>
          </View>
          <View style={styles.presets}>
            {THEMES.map(({ label, theme }) => (
              <Choice key={theme} label={label} on={progress.prefs.theme === theme} onPress={() => onSetPrefs({ theme })} />
            ))}
          </View>
          <View style={styles.presets}>
            {FONT_SCALES.map(({ label, scale }) => (
              <Choice key={scale} label={label} on={progress.prefs.fontScale === scale} onPress={() => onSetPrefs({ fontScale: scale })} />
            ))}
          </View>
          <View style={styles.sample}>
            <Txt size={15} weight={600}>
              원어민이 자주 쓰는 표현
            </Txt>
            <Txt size={13} color={colors.muted}>
              I'll look into it and get back to you.
            </Txt>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Txt size={15} weight={600}>
              앱 이름
            </Txt>
            <Txt size={15} color={colors.muted}>
              다시봄
            </Txt>
          </View>
          <View style={styles.infoRow}>
            <Txt size={15} weight={600}>
              학습 기록
            </Txt>
            <Txt size={15} color={colors.muted}>
              이 기기에만 저장돼요
            </Txt>
          </View>
        </View>

        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(PRIVACY_URL).catch(() => {})} style={styles.infoRow}>
          <Txt size={15} weight={600}>
            개인정보처리방침
          </Txt>
          <Txt size={15} color={colors.muted}>
            보기
          </Txt>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => setNotices((v) => !v)} style={styles.infoRow}>
          <Txt size={15} weight={600}>
            출처·라이선스
          </Txt>
          <Txt size={15} color={colors.muted}>
            {notices ? '접기' : '보기'}
          </Txt>
        </Pressable>
        {notices && (
          <View style={{ gap: 10 }}>
            <Txt size={13} color={colors.muted} lineHeight={1.6}>
              영단어 덱은 FrequencyWords(OpenSubtitles 자막 빈도 목록, CC BY-SA 4.0)를 원형 기준으로 묶고 기초 기능어·감탄사·인명·비속어를 뺀 뒤 뜻과 예문을 덧붙여 만들었어요. 같은 조건(CC BY-SA 4.0)으로 공유해요.
            </Txt>
            <Txt size={13} color={colors.muted} lineHeight={1.6}>
              발음기호는 CMU Pronouncing Dictionary(Copyright © 1993-2015 Carnegie Mellon University)의 미국식 발음을 IPA로 변환한 거예요.
            </Txt>
            <Txt size={13} color={colors.muted} lineHeight={1.6}>
              글꼴은 Space Grotesk, IBM Plex Sans KR(SIL Open Font License 1.1)이에요.
            </Txt>
          </View>
        )}
      </ScrollView>
      <BottomNav active="settings" onNavigate={onNavigate} />
    </View>
  );
}

function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.preset, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
    >
      <Txt size={13} weight={600} color={on ? colors.white : colors.ink} numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

function Stepper({ label, sign, disabled, onPress }: { label: string; sign: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.stepBtn, disabled && { opacity: 0.35 }, pressed && { opacity: 0.7 }]}
    >
      <Txt size={26} weight={500}>
        {sign}
      </Txt>
    </Pressable>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1 },
  body: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  tight: { letterSpacing: -0.56 },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presets: { flexDirection: 'row', gap: 8 },
  sample: { gap: 4, padding: 14, borderRadius: 14, backgroundColor: colors.exampleBg },
  preset: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
}));

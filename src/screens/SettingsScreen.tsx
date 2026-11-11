import { ComponentRef, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, Tab } from '../components/BottomNav';
import { Txt } from '../components/Txt';
import { FONT_SCALES, GOAL_MAX, GOAL_MIN, Prefs, Progress, SPEECH_RATES, THEMES } from '../progress';
import { SET_SIZES } from '../data/decks';
import { CC_BY_SA_URL, CMUDICT_LICENSE, CMUDICT_URL, FREQUENCY_WORDS_URL, OFL_URL } from '../data/licenses';
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
  onSetSetSize,
  onResetAll,
  onNavigate,
}: {
  progress: Progress;
  onSetGoal: (n: number) => void;
  onSetPrefs: (p: Partial<Prefs>) => void;
  onSetSetSize: (n: number) => void;
  onResetAll: () => void;
  onNavigate: (t: Tab) => void;
}) {
  const insets = useSafeAreaInsets();
  const goal = progress.goal;
  const reminder = progress.prefs.reminder;
  const [reminderNote, setReminderNote] = useState('');
  // 알림을 바꾸는 동안에는 다시 누르지 못하게 한다
  const [reminderBusy, setReminderBusy] = useState(false);
  const [linkNote, setLinkNote] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  // 세트 크기는 진행 위치가 초기화되므로 한 번 더 확인한다
  const [pendingSize, setPendingSize] = useState<number | null>(null);
  const setSize = progress.prefs.setSize;
  const [notices, setNotices] = useState(false);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  // 출처는 화면 맨 아래에 펼쳐지므로, 열면 "출처·라이선스" 줄이 위로 오도록 내려서 내용이 바로 보이게 한다
  const wantScroll = useRef(false);
  const noticesY = useRef(0);
  const toggleNotices = () => {
    wantScroll.current = !notices;
    setNotices(!notices);
  };

  const openLink = (url: string) => {
    setLinkNote('');
    Linking.openURL(url).catch(() => setLinkNote('링크를 열지 못했어요. 인터넷 연결을 확인하고 다시 눌러 주세요.'));
  };

  const changeReminder = async (next: Reminder) => {
    if (reminderBusy) return;
    setReminderBusy(true);
    setReminderNote('');
    const result = await applyReminder(next);
    setReminderBusy(false);
    if (!next.on) {
      // 예약을 못 지웠는데 꺼진 것으로 저장하면 알림이 계속 올 수 있으니, 실패하면 켜진 채로 둔다
      if (result === 'error') setReminderNote('알림을 끄지 못했어요. 잠시 뒤 다시 시도해 주세요.');
      else onSetPrefs({ reminder: next });
      return;
    }
    if (result === 'ok') {
      onSetPrefs({ reminder: next });
    } else if (result === 'error') {
      // 예약에 실패하면 기존 알림은 그대로 두고 설정도 바꾸지 않는다
      setReminderNote('알림을 예약하지 못했어요. 잠시 뒤 다시 시도해 주세요.');
    } else {
      onSetPrefs({ reminder: { ...next, on: false } });
      setReminderNote(result === 'denied' ? '알림 권한이 꺼져 있어요. 기기 설정에서 허용해 주세요.' : '알림은 모바일 앱에서만 쓸 수 있어요.');
    }
  };
  const shift = (min: number) => {
    const total = (reminder.hour * 60 + reminder.minute + min + 1440) % 1440;
    changeReminder({ ...reminder, hour: Math.floor(total / 60), minute: total % 60 });
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scroll}
        onContentSizeChange={() => {
          // 펼친 내용이 그려져 길이가 정해진 뒤에 내린다
          if (wantScroll.current) {
            wantScroll.current = false;
            scroll.current?.scrollTo({ y: Math.max(0, noticesY.current - 16), animated: true });
          }
        }}
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
              한 세트의 카드 수
            </Txt>
            <Txt size={13} color={colors.muted}>
              영단어·구동사·문장 덱을 몇 장씩 나눠 공부할지 정해요. 처음엔 50장이에요.
            </Txt>
          </View>
          <View style={styles.presets}>
            {SET_SIZES.map((n) => {
              const on = n === setSize;
              return (
                <Pressable
                  key={n}
                  accessibilityRole="button"
                  accessibilityLabel={`한 세트 ${n}장`}
                  accessibilityState={{ selected: on }}
                  onPress={() => setPendingSize(on ? null : n)}
                  style={[styles.preset, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                >
                  <Txt size={14} weight={600} color={on ? colors.white : colors.ink} tabular>
                    {String(n)}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
          {pendingSize !== null && (
            <View style={{ gap: 10 }}>
              <Txt size={13} lineHeight={1.45} color={colors.muted}>
                {`${pendingSize}장씩으로 바꾸면 세트 번호가 달라져서, 진행 중이던 회독 위치와 퀴즈 최고 점수가 처음으로 돌아가요. 외운 카드, 복습 일정, 연속 학습일은 그대로예요.`}
              </Txt>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setPendingSize(null)}
                  style={[styles.preset, { flex: 1, height: undefined, minHeight: 44, paddingVertical: 8 }]}
                >
                  <Txt size={14} weight={600}>
                    취소
                  </Txt>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    onSetSetSize(pendingSize);
                    setPendingSize(null);
                  }}
                  style={[styles.preset, { flex: 1, height: undefined, minHeight: 44, paddingVertical: 8, backgroundColor: colors.ink, borderColor: colors.ink }]}
                >
                  <Txt size={14} weight={600} color={colors.white}>
                    {`${pendingSize}장씩으로 바꾸기`}
                  </Txt>
                </Pressable>
              </View>
            </View>
          )}
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
              disabled={reminderBusy}
              value={reminder.on}
              onValueChange={(v) => changeReminder({ ...reminder, on: v })}
              trackColor={{ true: colors.accent, false: colors.borderStrong }}
              thumbColor={colors.white}
            />
          </View>
          {reminder.on && (
            <View style={styles.stepper}>
              <Stepper label="30분 일찍" sign="−" disabled={reminderBusy} onPress={() => shift(-30)} />
              <Txt size={26} weight={700} style={styles.tight} tabular>
                {timeLabel(reminder)}
              </Txt>
              <Stepper label="30분 늦게" sign="+" disabled={reminderBusy} onPress={() => shift(30)} />
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
              링고루프
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

        <View style={styles.card}>
          <View style={{ gap: 4 }}>
            <Txt size={17} weight={600}>
              학습 기록 지우기
            </Txt>
            <Txt size={13} color={colors.muted}>
              외운 카드, 복습 일정, 퀴즈 점수, 연속 학습일을 모두 지우고 처음부터 다시 시작해요. 설정과 즐겨찾기는 그대로예요.
            </Txt>
          </View>
          {confirmReset ? (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable accessibilityRole="button" onPress={() => setConfirmReset(false)} style={[styles.preset, { flex: 1, height: undefined, minHeight: 44, paddingVertical: 8 }]}>
                <Txt size={14} weight={600}>
                  취소
                </Txt>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onResetAll();
                  setConfirmReset(false);
                }}
                style={[styles.preset, { flex: 1, height: undefined, minHeight: 44, paddingVertical: 8, backgroundColor: colors.bad, borderColor: colors.bad }]}
              >
                <Txt size={14} weight={600} color="#FFFFFF">
                  정말 지우기
                </Txt>
              </Pressable>
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => setConfirmReset(true)} style={[styles.preset, { height: undefined, minHeight: 44, paddingVertical: 8 }]}>
              <Txt size={14} weight={600} color={colors.bad}>
                학습 기록 지우기
              </Txt>
            </Pressable>
          )}
        </View>

        <Pressable accessibilityRole="link" onPress={() => openLink(PRIVACY_URL)} style={styles.infoRow}>
          <Txt size={15} weight={600}>
            개인정보처리방침
          </Txt>
          <Txt size={15} color={colors.muted}>
            보기
          </Txt>
        </Pressable>

        {linkNote !== '' && (
          <Txt size={13} color={colors.bad}>
            {linkNote}
          </Txt>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: notices }}
          onLayout={(e) => (noticesY.current = e.nativeEvent.layout.y)}
          onPress={toggleNotices}
          style={styles.infoRow}
        >
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
            <LinkRow label="FrequencyWords 저장소" onPress={() => openLink(FREQUENCY_WORDS_URL)} />
            <LinkRow label="CC BY-SA 4.0 라이선스 전문" onPress={() => openLink(CC_BY_SA_URL)} />
            <Txt size={13} color={colors.muted} lineHeight={1.6}>
              발음기호는 CMU Pronouncing Dictionary의 미국식 발음을 IPA로 변환한 거예요. 아래는 그 라이선스 전문이에요.
            </Txt>
            <LinkRow label="CMU Pronouncing Dictionary 저장소" onPress={() => openLink(CMUDICT_URL)} />
            <View style={styles.licenseBox}>
              <Txt size={11} color={colors.muted} lineHeight={1.5}>
                {CMUDICT_LICENSE}
              </Txt>
            </View>
            <Txt size={13} color={colors.muted} lineHeight={1.6}>
              글꼴은 Space Grotesk, IBM Plex Sans KR(SIL Open Font License 1.1)이에요.
            </Txt>
            <LinkRow label="SIL Open Font License 1.1 전문" onPress={() => openLink(OFL_URL)} />
            <Txt size={13} color={colors.muted} lineHeight={1.6}>
              영어 발음은 Google Cloud Text-to-Speech로 만든 합성 음성이에요. 앱에 포함되어 있어서 인터넷 없이도 들을 수 있어요.
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

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.linkRow}>
      <Txt size={14} weight={600} color={colors.accent}>
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
  linkRow: { minHeight: 44, justifyContent: 'center' },
  licenseBox: { padding: 12, borderRadius: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
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

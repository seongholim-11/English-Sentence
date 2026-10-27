import * as Speech from 'expo-speech';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, Tab } from '../components/BottomNav';
import { Txt } from '../components/Txt';
import { GOAL_MAX, GOAL_MIN, Prefs, Progress, SPEECH_RATES } from '../progress';
import { colors } from '../theme';

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
                    Speech.stop();
                    Speech.speak('How are you doing today?', { language: 'en-US', rate });
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
      </ScrollView>
      <BottomNav active="settings" onNavigate={onNavigate} />
    </View>
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

const styles = StyleSheet.create({
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
});

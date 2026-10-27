import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, Tab } from '../components/BottomNav';
import { FlameIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { CardDeckId, cardDecks } from '../data/decks';
import { Progress, recentDays, todayCount, visibleStreak } from '../progress';
import { colors } from '../theme';

const CHART_H = 120;

const withCommas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function StatsScreen({ progress, onNavigate }: { progress: Progress; onNavigate: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const days = recentDays(progress, 7);
  const week = days.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(progress.goal, ...days.map((d) => d.count));
  const mastered = (Object.keys(cardDecks) as CardDeckId[]).reduce((sum, d) => sum + progress.mastered[d].length, 0);
  const studied = Object.values(progress.history).filter((n) => n > 0).length;
  const goalY = (progress.goal / max) * CHART_H;

  const stats: [string, string][] = [
    ['오늘', `${todayCount(progress)}장`],
    ['7일 합계', `${withCommas(week)}장`],
    ['외운 카드', `${withCommas(mastered)}장`],
    ['공부한 날', `${studied}일`],
  ];

  return (
    <View style={styles.root}>
      <View style={[styles.body, { paddingTop: insets.top + 16 }]}>
        <View style={{ gap: 4 }}>
          <Txt size={13} weight={500} color={colors.muted}>
            나의 공부 기록
          </Txt>
          <Txt size={28} weight={700} style={styles.tight}>
            기록
          </Txt>
        </View>

        <View style={styles.hero}>
          <FlameIcon size={28} />
          <View style={{ gap: 2 }}>
            <Txt size={34} weight={700} color={colors.white} style={styles.tight} tabular>
              {`${visibleStreak(progress)}일`}
            </Txt>
            <Txt size={13} color={colors.heroSub}>
              연속으로 공부하고 있어요
            </Txt>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Txt size={15} weight={600}>
              최근 7일
            </Txt>
            <Txt size={12} color={colors.muted}>
              {`하루 목표 ${progress.goal}장`}
            </Txt>
          </View>
          <View style={{ height: CHART_H + 40 }}>
            <View style={[styles.goalLine, { bottom: 20 + goalY }]} />
            <View style={styles.bars}>
              {days.map((d, i) => {
                const today = i === days.length - 1;
                return (
                  <View key={d.date} style={styles.barCol}>
                    <Txt size={11} color={colors.muted} tabular style={styles.center}>
                      {String(d.count)}
                    </Txt>
                    <View style={{ height: CHART_H, justifyContent: 'flex-end' }}>
                      <View
                        style={{
                          height: Math.max(4, (d.count / max) * CHART_H),
                          borderRadius: 6,
                          backgroundColor: d.count >= progress.goal ? colors.accent : today ? '#9DB2FF' : colors.track,
                        }}
                      />
                    </View>
                    <Txt size={12} weight={today ? 700 : 500} color={today ? colors.ink : colors.muted} style={styles.center}>
                      {d.label}
                    </Txt>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.grid]}>
          {stats.map(([label, value]) => (
            <View key={label} style={styles.stat}>
              <Txt size={11} color={colors.muted} numberOfLines={1}>
                {label}
              </Txt>
              <Txt size={17} weight={700} tabular numberOfLines={1}>
                {value}
              </Txt>
            </View>
          ))}
        </View>
      </View>
      <BottomNav active="stats" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  tight: { letterSpacing: -0.56 },
  center: { textAlign: 'center' },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.ink,
    borderRadius: 24,
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  goalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: 'dashed',
  },
  bars: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'stretch', gap: 4 },
  grid: { flexDirection: 'row', gap: 4, paddingVertical: 14, paddingHorizontal: 12 },
  stat: { flex: 1, gap: 4 },
});

import { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar } from '../components/Bits';
import { ArrowRightIcon, DecksIcon, FlameIcon, HomeIcon, SettingsIcon, StatsIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { DeckId, DeckMeta, cardDecks, deckMeta, decks, frequencyDecks } from '../data/decks';
import { dialogues } from '../data/dialogues';
import { Progress, todayCount, visibleStreak } from '../progress';
import { DAILY_GOAL, colors } from '../theme';

const frequencyTotal = frequencyDecks.reduce((n, d) => n + (d.id === 'dialogue' ? 0 : cardDecks[d.id].length), 0);

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const dateLabel = (d = new Date()) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;

export const roundOf = (p: Progress, id: DeckId) => (id === 'dialogue' ? p.dialogue.round : p.decks[id].round);

const deckStats = (p: Progress, d: DeckMeta) => {
  if (d.id === 'dialogue') {
    const total = dialogues.length;
    return { pct: (p.dialogue.pos / total) * 100, progress: `${p.dialogue.pos} / ${total}편` };
  }
  const total = cardDecks[d.id].length;
  const done = p.mastered[d.id].length;
  return { pct: (done / total) * 100, progress: `${done} / ${total}장` };
};

type Props = {
  progress: Progress;
  onOpenDeck: (id: DeckId) => void;
};

export function HomeScreen({ progress, onOpenDeck }: Props) {
  const insets = useSafeAreaInsets();
  const seen = todayCount(progress);
  const left = Math.max(0, DAILY_GOAL - seen);
  const last = deckMeta(progress.lastDeck);

  const soon = () => Alert.alert('준비 중이에요', '지금은 홈에서 덱을 골라 공부할 수 있어요.');

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}>
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Txt size={13} weight={500} color={colors.muted}>
              {dateLabel()}
            </Txt>
            <Txt size={28} weight={700} style={styles.tight}>
              오늘의 회독
            </Txt>
          </View>
          <View style={styles.streak}>
            <FlameIcon />
            <Txt size={13} weight={600}>
              {`${visibleStreak(progress)}일 연속`}
            </Txt>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={{ gap: 4 }}>
              <Txt size={13} color={colors.heroSub}>
                오늘 본 카드
              </Txt>
              <Txt size={34} weight={700} color={colors.white} style={styles.tight} tabular>
                {String(seen)}
                <Txt size={18} weight={500} color={colors.heroFaint}>
                  {` / ${DAILY_GOAL}`}
                </Txt>
              </Txt>
            </View>
            <Txt size={13} color={colors.heroSub}>
              {left > 0 ? `목표까지 ${left}장` : '오늘 목표 달성!'}
            </Txt>
          </View>
          <Bar pct={(seen / DAILY_GOAL) * 100} color={colors.accent} track="rgba(255,255,255,0.14)" height={6} />
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpenDeck(last.id)}
            style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.85 }]}
          >
            <Txt size={15} weight={600} color={colors.white}>
              {`${last.name} ${roundOf(progress, last.id)}회독 이어서`}
            </Txt>
            <ArrowRightIcon />
          </Pressable>
        </View>

        <DeckSection title="내 덱" note="탭해서 바로 시작" list={decks} progress={progress} onOpenDeck={onOpenDeck} />
        <DeckSection
          title="회화 빈도순 단어"
          note={`${String(frequencyTotal).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}개 · 영화·드라마 대사 기준`}
          list={frequencyDecks}
          progress={progress}
          onOpenDeck={onOpenDeck}
        />
      </ScrollView>

      <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <NavTab label="홈" active icon={<HomeIcon color={colors.ink} />} />
        <NavTab label="덱" onPress={soon} icon={<DecksIcon />} />
        <NavTab label="기록" onPress={soon} icon={<StatsIcon />} />
        <NavTab label="설정" onPress={soon} icon={<SettingsIcon />} />
      </View>
    </View>
  );
}

function DeckSection({
  title,
  note,
  list,
  progress,
  onOpenDeck,
}: {
  title: string;
  note: string;
  list: DeckMeta[];
  progress: Progress;
  onOpenDeck: (id: DeckId) => void;
}) {
  const rows: DeckMeta[][] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.sectionHead}>
        <Txt size={17} weight={600}>
          {title}
        </Txt>
        <Txt size={13} color={colors.muted}>
          {note}
        </Txt>
      </View>
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((d) => {
            const s = deckStats(progress, d);
            return (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                onPress={() => onOpenDeck(d.id)}
                style={({ pressed }) => [styles.deck, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.deckTop}>
                  <View style={[styles.mono, { backgroundColor: d.soft }]}>
                    <Txt size={13} weight={700} color={d.deep}>
                      {d.mono}
                    </Txt>
                  </View>
                  <Txt size={12} weight={500} color={colors.muted}>
                    {`${roundOf(progress, d.id)}회독`}
                  </Txt>
                </View>
                <View style={{ gap: 2 }}>
                  <Txt size={17} weight={600}>
                    {d.name}
                  </Txt>
                  <Txt size={12} color={colors.muted}>
                    {d.sub}
                  </Txt>
                </View>
                <View style={styles.deckBottom}>
                  <Bar pct={s.pct} color={d.color} track={colors.track} height={4} />
                  <Txt size={12} color={colors.muted} tabular>
                    {s.progress}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function NavTab({ label, icon, active, onPress }: { label: string; icon: ReactNode; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: !!active }} onPress={onPress} style={styles.tab}>
      {icon}
      <Txt size={11} weight={active ? 600 : 500} color={active ? colors.ink : colors.navMuted}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 20, gap: 22 },
  tight: { letterSpacing: -0.56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: { backgroundColor: colors.ink, borderRadius: 24, padding: 20, gap: 16 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  row: { flexDirection: 'row', gap: 12 },
  deck: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    minHeight: 156,
  },
  deckTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mono: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deckBottom: { gap: 6, marginTop: 'auto' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: { width: 72, height: 52, alignItems: 'center', justifyContent: 'center', gap: 3 },
});

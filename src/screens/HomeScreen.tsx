import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar } from '../components/Bits';
import { BottomNav, Tab } from '../components/BottomNav';
import { ArrowRightIcon, FlameIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { DeckId, DeckMeta, cardDecks, deckMeta, decks, setCount } from '../data/decks';
import { dialogues } from '../data/dialogues';
import { Progress, SetRef, roundState, todayCount, visibleStreak } from '../progress';
import { colors } from '../theme';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const dateLabel = (d = new Date()) => `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;

// 덱 카드 오른쪽 위: 대화문은 회독 수, 카드 덱은 세트 수
const badgeOf = (p: Progress, id: DeckId) => (id === 'dialogue' ? `${p.dialogue.round}회독` : `${setCount(id)}세트`);

const withCommas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// 홈의 '이어서' 버튼: 마지막으로 공부한 대화문이나 세트
const continueOf = (p: Progress): { label: string; set: SetRef | null; deck: DeckId } => {
  if (p.lastDeck === 'dialogue') return { label: `대화문 ${p.dialogue.round}회독 이어서`, set: null, deck: 'dialogue' };
  const name = deckMeta(p.lastDeck).name;
  if (p.lastSet?.deck === p.lastDeck) {
    const round = roundState(p, p.lastSet).round;
    return { label: `${name} ${p.lastSet.set + 1}세트 ${round}회독 이어서`, set: p.lastSet, deck: p.lastDeck };
  }
  return { label: `${name} 공부 시작`, set: null, deck: p.lastDeck };
};

export const deckStats = (p: Progress, d: DeckMeta) => {
  if (d.id === 'dialogue') {
    const total = dialogues.length;
    return { pct: (p.dialogue.pos / total) * 100, progress: `${p.dialogue.pos} / ${total}편` };
  }
  const total = cardDecks[d.id].length;
  const done = p.mastered[d.id].length;
  return { pct: (done / total) * 100, progress: `${withCommas(done)} / ${withCommas(total)}장` };
};

type Props = {
  progress: Progress;
  onOpenDeck: (id: DeckId) => void;
  onOpenSet: (s: SetRef) => void;
  onNavigate: (t: Tab) => void;
};

export function HomeScreen({ progress, onOpenDeck, onOpenSet, onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  const seen = todayCount(progress);
  const goal = progress.goal;
  const left = Math.max(0, goal - seen);
  const next = continueOf(progress);

  return (
    <View style={styles.root}>
      <View style={[styles.scroll, { paddingTop: insets.top + 16 }]}>
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
                  {` / ${goal}`}
                </Txt>
              </Txt>
            </View>
            <Txt size={13} color={colors.heroSub}>
              {left > 0 ? `목표까지 ${left}장` : '오늘 목표 달성!'}
            </Txt>
          </View>
          <Bar pct={(seen / goal) * 100} color={colors.accent} track="rgba(255,255,255,0.14)" height={6} />
          <Pressable
            accessibilityRole="button"
            onPress={() => (next.set ? onOpenSet(next.set) : onOpenDeck(next.deck))}
            style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.85 }]}
          >
            <Txt size={15} weight={600} color={colors.white}>
              {next.label}
            </Txt>
            <ArrowRightIcon />
          </Pressable>
        </View>

        <DeckSection title="내 덱" note="탭해서 바로 시작" list={decks} progress={progress} onOpenDeck={onOpenDeck} />
      </View>

      <BottomNav active="home" onNavigate={onNavigate} />
    </View>
  );
}

const CARD_GAP = 12;
const CARD_MAX_H = 168;
const CARD_MIN_H = 84;

// 덱 카드가 남은 공간에 맞춰 줄어들어 홈이 스크롤 없이 한 화면에 들어간다
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
  const [gridH, setGridH] = useState(0);
  const rows: DeckMeta[][] = [];
  for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
  const cardH = Math.max(CARD_MIN_H, Math.min(CARD_MAX_H, (gridH - CARD_GAP * (rows.length - 1)) / rows.length));
  const compact = cardH < 164;

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={styles.sectionHead}>
        <Txt size={17} weight={600}>
          {title}
        </Txt>
        <Txt size={13} color={colors.muted}>
          {note}
        </Txt>
      </View>
      <View style={{ flex: 1, gap: CARD_GAP }} onLayout={(e) => setGridH(e.nativeEvent.layout.height)}>
        {gridH > 0 &&
          rows.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((d) => {
                const s = deckStats(progress, d);
                return (
                  <Pressable
                    key={d.id}
                    accessibilityRole="button"
                    onPress={() => onOpenDeck(d.id)}
                    style={({ pressed }) => [
                      styles.deck,
                      { height: cardH, gap: compact ? 8 : 14, padding: compact ? 14 : 16 },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View style={styles.deckTop}>
                      <View style={[styles.mono, { backgroundColor: d.soft }, compact && styles.monoSmall]}>
                        <Txt size={compact ? 11 : 13} weight={700} color={d.deep}>
                          {d.mono}
                        </Txt>
                      </View>
                      {compact && (
                        <Txt size={16} weight={600} numberOfLines={1} style={{ flex: 1 }}>
                          {d.name}
                        </Txt>
                      )}
                      {!compact && (
                        <Txt size={12} weight={500} color={colors.muted}>
                          {badgeOf(progress, d.id)}
                        </Txt>
                      )}
                    </View>
                    {!compact && (
                      <View style={{ gap: 2 }}>
                        <Txt size={17} weight={600}>
                          {d.name}
                        </Txt>
                        <Txt size={12} color={colors.muted}>
                          {d.sub}
                        </Txt>
                      </View>
                    )}
                    <View style={styles.deckBottom}>
                      <Bar pct={s.pct} color={d.color} track={colors.track} height={4} />
                      <View style={styles.deckTop}>
                        <Txt size={12} color={colors.muted} tabular>
                          {s.progress}
                        </Txt>
                        {compact && (
                          <Txt size={12} weight={500} color={colors.muted}>
                            {badgeOf(progress, d.id)}
                          </Txt>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, gap: 22 },
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
  },
  deckTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  mono: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  monoSmall: { width: 30, height: 30, borderRadius: 10 },
  deckBottom: { gap: 6, marginTop: 'auto' },
});

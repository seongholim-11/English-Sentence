import { useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Btn, IconButton } from '../components/Bits';
import { ArrowRightIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { CardDeckId, SET_SIZE, cardDecks, deckMeta, setCards, setCount } from '../data/decks';
import { Progress, SetRef, roundState, setKey } from '../progress';
import { colors } from '../theme';

const GAP = 8;
const MIN_TILE_H = 56;
const MAX_TILE_H = 104;

const withCommas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// 세트가 몇 개든 스크롤 없이 한 화면에 들어가도록 열 수를 고른다
const fitGrid = (n: number, w: number, h: number) => {
  for (let cols = 2; cols <= 8; cols++) {
    const rows = Math.ceil(n / cols);
    const tileH = (h - (rows - 1) * GAP) / rows;
    if (tileH >= MIN_TILE_H || cols === 8) {
      const h2 = Math.floor(Math.min(MAX_TILE_H, Math.max(tileH, MIN_TILE_H)));
      return { tileW: Math.floor((w - (cols - 1) * GAP) / cols), tileH: h2, overflow: rows * (h2 + GAP) - GAP > h };
    }
  }
  return null;
};

type Props = {
  deck: CardDeckId;
  progress: Progress;
  onOpenSet: (s: SetRef) => void;
  onHome: () => void;
};

export function SetsScreen({ deck, progress, onOpenSet, onHome }: Props) {
  const insets = useSafeAreaInsets();
  const [area, setArea] = useState<{ w: number; h: number } | null>(null);
  const meta = deckMeta(deck);
  const total = cardDecks[deck].length;
  const count = setCount(deck);
  const mastered = new Set(progress.mastered[deck]);
  const last = progress.lastSet?.deck === deck ? progress.lastSet.set : 0;
  const grid = area ? fitGrid(count, area.w, area.h) : null;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setArea({ w: width, h: height });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 30) }]}>
      <View style={styles.header}>
        <IconButton label="홈으로" onPress={onHome} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={16} weight={600}>
            {meta.name}
          </Txt>
          <Txt size={12} color={colors.muted}>
            {`${withCommas(total)}장 · ${SET_SIZE}장씩 ${count}세트`}
          </Txt>
        </View>
        <Txt size={15} weight={600} tabular>
          {`${withCommas(mastered.size)} / ${withCommas(total)}`}
        </Txt>
      </View>
      <Bar pct={(mastered.size / total) * 100} color={meta.color} track={colors.border} height={6} />

      <View style={{ flex: 1 }} onLayout={onLayout}>
        {grid && (
          <ScrollView scrollEnabled={grid.overflow} contentContainerStyle={styles.grid}>
            {Array.from({ length: count }, (_, set) => {
              const cards = setCards(deck, set);
              const done = cards.filter((c) => mastered.has(c.id)).length;
              const started = !!progress.sets[setKey({ deck, set })];
              const round = roundState(progress, { deck, set }).round;
              const complete = done === cards.length;
              const current = set === last;
              const roomy = grid.tileH >= 80;
              return (
                <Pressable
                  key={set}
                  accessibilityRole="button"
                  accessibilityLabel={`${set + 1}세트, ${cards.length}장 중 ${done}장 외움`}
                  onPress={() => onOpenSet({ deck, set })}
                  style={({ pressed }) => [
                    styles.tile,
                    { width: grid.tileW, height: grid.tileH, padding: grid.tileW < 60 ? 8 : 12 },
                    complete && { backgroundColor: meta.soft, borderColor: meta.soft },
                    current && { borderColor: meta.color, borderWidth: 2 },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <View style={styles.tileTop}>
                    <Txt size={grid.tileW < 60 ? 17 : 20} weight={700} color={complete ? meta.deep : colors.ink} tabular>
                      {String(set + 1)}
                    </Txt>
                    {roomy && started && (
                      <Txt size={11} weight={500} color={colors.muted}>
                        {`${round}회독`}
                      </Txt>
                    )}
                  </View>
                  {roomy && (
                    <Txt size={11} color={colors.muted} tabular>
                      {`${set * SET_SIZE + 1}–${set * SET_SIZE + cards.length}`}
                    </Txt>
                  )}
                  <View style={{ marginTop: 'auto' }}>
                    <Bar pct={(done / cards.length) * 100} color={meta.color} track={colors.track} height={4} />
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Btn
        label={`${last + 1}세트 ${roundState(progress, { deck, set: last }).round}회독 이어서`}
        primary
        accent={colors.accent}
        height={56}
        size={15}
        onPress={() => onOpenSet({ deck, set: last })}
        icon={<ArrowRightIcon />}
        style={{ flexDirection: 'row-reverse', borderWidth: 0 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    gap: 2,
  },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});

import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar } from '../components/Bits';
import { BottomNav, Tab } from '../components/BottomNav';
import { Txt } from '../components/Txt';
import { DeckId, DeckMeta, decks, setCount } from '../data/decks';
import { Progress } from '../progress';
import { colors } from '../theme';
import { deckStats } from './HomeScreen';

type Props = {
  progress: Progress;
  onOpenDeck: (id: DeckId) => void;
  onNavigate: (t: Tab) => void;
};

const detail = (d: DeckMeta, p: Progress) =>
  d.id === 'dialogue' ? `${p.dialogue.round}회독 중` : `${setCount(d.id)}세트 · 50장씩`;

export function DecksScreen({ progress, onOpenDeck, onNavigate }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <View style={[styles.body, { paddingTop: insets.top + 16 }]}>
        <View style={{ gap: 4 }}>
          <Txt size={13} weight={500} color={colors.muted}>
            모든 덱
          </Txt>
          <Txt size={28} weight={700} style={styles.tight}>
            덱
          </Txt>
        </View>
        <View style={styles.list}>
          {decks.map((d) => {
            const s = deckStats(progress, d);
            return (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                accessibilityLabel={`${d.name} 덱 열기`}
                onPress={() => onOpenDeck(d.id)}
                style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
              >
                <View style={[styles.mono, { backgroundColor: d.soft }]}>
                  <Txt size={13} weight={700} color={d.deep}>
                    {d.mono}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={styles.line}>
                    <Txt size={17} weight={600}>
                      {d.name}
                    </Txt>
                    <Txt size={12} color={colors.muted} tabular>
                      {s.progress}
                    </Txt>
                  </View>
                  <Bar pct={s.pct} color={d.color} track={colors.track} height={4} />
                  <Txt size={12} color={colors.muted}>
                    {`${d.sub} · ${detail(d, progress)}`}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
      <BottomNav active="decks" onNavigate={onNavigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, gap: 20 },
  tight: { letterSpacing: -0.56 },
  list: { flex: 1, gap: 12 },
  row: {
    flex: 1,
    maxHeight: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  mono: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});

import { ComponentRef, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Btn, IconButton } from '../components/Bits';
import { Txt } from '../components/Txt';
import { CardDeckId, SET_SIZE, cardDecks, deckMeta, setCards, setCount } from '../data/decks';
import { Progress, SetRef, roundState, setKey } from '../progress';
import { colors } from '../theme';

const CARD_H = 156;
const GAP = 12;

const withCommas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

type Props = {
  deck: CardDeckId;
  progress: Progress;
  onStudy: (s: SetRef) => void;
  onQuiz: (s: SetRef) => void;
  onBack: () => void;
};

// 세트마다 큰 카드 하나: 암기와 퀴즈 버튼이 들어 있다
export function SetsScreen({ deck, progress, onStudy, onQuiz, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const meta = deckMeta(deck);
  const total = cardDecks[deck].length;
  const count = setCount(deck);
  const mastered = new Set(progress.mastered[deck]);
  const last = progress.lastSet?.deck === deck ? progress.lastSet.set : 0;

  // 마지막으로 공부한 세트가 보이는 위치에서 시작한다
  useEffect(() => {
    scroll.current?.scrollTo({ y: Math.max(0, last * (CARD_H + GAP) - 8), animated: false });
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.header}>
        <IconButton label="덱 목록으로" onPress={onBack} />
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

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ gap: GAP }} showsVerticalScrollIndicator={false}>
        {Array.from({ length: count }, (_, set) => {
          const ref = { deck, set };
          const cards = setCards(deck, set);
          const done = cards.filter((c) => mastered.has(c.id)).length;
          const started = !!progress.sets[setKey(ref)];
          const round = roundState(progress, ref).round;
          const quiz = progress.quiz[setKey(ref)];
          const complete = done === cards.length;
          return (
            <View
              key={set}
              style={[
                styles.card,
                complete && { backgroundColor: meta.soft, borderColor: meta.soft },
                set === last && { borderColor: meta.color, borderWidth: 2 },
              ]}
            >
              <View style={styles.top}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                  <Txt size={30} weight={700} color={complete ? meta.deep : colors.ink} tabular style={{ letterSpacing: -0.9 }}>
                    {String(set + 1)}
                  </Txt>
                  <Txt size={13} color={colors.muted} tabular>
                    {`${set * SET_SIZE + 1}–${set * SET_SIZE + cards.length}`}
                  </Txt>
                </View>
                <Txt size={12} weight={500} color={colors.muted} tabular>
                  {`${started ? `${round}회독 · ` : ''}${done} / ${cards.length}장`}
                  {quiz ? ` · 퀴즈 ${quiz.best}/${quiz.total}` : ''}
                </Txt>
              </View>
              <Bar pct={(done / cards.length) * 100} color={meta.color} track={colors.track} height={4} />
              <View style={styles.actions}>
                <Btn label="암기" primary accent={colors.ink} height={46} size={15} onPress={() => onStudy(ref)} style={{ flex: 1, borderWidth: 0 }} />
                <Btn label="퀴즈" primary accent={meta.color} height={46} size={15} onPress={() => onQuiz(ref)} style={{ flex: 1, borderWidth: 0 }} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    height: CARD_H,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  actions: { flexDirection: 'row', gap: 10 },
});

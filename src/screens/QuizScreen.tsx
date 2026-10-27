import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Btn, Chip, IconButton } from '../components/Bits';
import { Txt } from '../components/Txt';
import { CardDeckId, deckMeta } from '../data/decks';
import { makeQuiz } from '../quiz';
import { colors, createStyles } from '../theme';

type Props = {
  deck: CardDeckId;
  set: number;
  onAnswer: (cardId: string, correct: boolean) => void;
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
};

export function QuizScreen({ deck, set, onAnswer, onFinish, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const meta = deckMeta(deck);
  const [round, setRound] = useState(0);
  const questions = useMemo(() => makeQuiz(deck, set), [deck, set, round]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const score = total - wrong.length;
  const q = questions[idx];

  const pad = { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 30) };

  const choose = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === q.answer;
    if (!ok) setWrong((w) => w.concat([q.card.front]));
    onAnswer(q.card.id, ok);
  };

  const next = () => {
    if (idx + 1 >= total) {
      onFinish(score, total);
      setDone(true);
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  };

  const retry = () => {
    setRound((r) => r + 1);
    setIdx(0);
    setPicked(null);
    setWrong([]);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <View style={[styles.root, pad]}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <IconButton label="세트 목록으로" kind="close" onPress={onBack} />
        </View>
        <View style={{ gap: 10 }}>
          <Chip label={`${meta.name} · ${set + 1}세트 퀴즈`} bg={meta.soft} fg={meta.deep} />
          <Txt size={38} weight={700} lineHeight={1.1} style={{ letterSpacing: -1.14 }}>
            {`${total}문제 중 ${score}개 정답`}
          </Txt>
          <Txt size={15} lineHeight={1.55} color={colors.muted}>
            {wrong.length > 0 ? '틀린 카드는 오늘 복습에 다시 나와요.' : '전부 맞혔어요!'}
          </Txt>
        </View>
        <Bar pct={pct} color={meta.color} track={colors.borderStrong} height={10} />
        {wrong.length > 0 && (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8 }}>
            <Txt size={13} weight={600} color={colors.muted}>
              다시 볼 카드
            </Txt>
            {wrong.map((w) => (
              <View key={w} style={styles.wrongRow}>
                <Txt size={15} weight={500} numberOfLines={2}>
                  {w}
                </Txt>
              </View>
            ))}
          </ScrollView>
        )}
        {wrong.length === 0 && <View style={{ flex: 1 }} />}
        <View style={{ gap: 10 }}>
          <Btn label="한 번 더 풀기" primary accent={colors.accent} onPress={retry} style={{ borderWidth: 0 }} />
          <Btn label="세트 목록으로" onPress={onBack} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, pad]}>
      <View style={styles.header}>
        <IconButton label="세트 목록으로" onPress={onBack} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={16} weight={600}>
            {`${meta.name} · ${set + 1}세트 퀴즈`}
          </Txt>
          <Txt size={12} color={colors.muted}>
            {q.kind === 'meaning' ? '뜻 고르기' : '빈칸 채우기'}
          </Txt>
        </View>
        <Txt size={15} weight={600} tabular>
          {`${idx + 1} / ${total}`}
        </Txt>
      </View>
      <Bar pct={(idx / total) * 100} color={colors.accent} track={colors.border} height={6} />

      <View style={styles.card}>
        <Txt size={q.kind === 'blank' || q.prompt.length > 24 ? 22 : 40} weight={700} lineHeight={1.3}>
          {q.prompt}
        </Txt>
        <Txt size={14} color={colors.muted} lineHeight={1.4}>
          {q.hint}
        </Txt>
      </View>

      <View style={{ gap: 10 }}>
        {q.choices.map((c, i) => {
          const isAnswer = i === q.answer;
          const state = picked === null ? null : isAnswer ? 'good' : i === picked ? 'bad' : null;
          return (
            <Pressable
              key={`${idx}-${i}`}
              accessibilityRole="button"
              onPress={() => choose(i)}
              style={({ pressed }) => [
                styles.choice,
                state === 'good' && { backgroundColor: colors.goodSoft, borderColor: colors.good },
                state === 'bad' && { backgroundColor: colors.badSoft, borderColor: colors.bad },
                picked !== null && !state && { opacity: 0.5 },
                pressed && picked === null && { opacity: 0.85 },
              ]}
            >
              <Txt size={15} weight={500} lineHeight={1.35} style={{ flex: 1 }}>
                {c}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 56 }}>
        {picked !== null && (
          <Btn
            label={idx + 1 >= total ? '결과 보기' : '다음 문제'}
            primary
            accent={picked === q.answer ? colors.good : colors.bad}
            height={56}
            size={15}
            onPress={next}
            style={{ borderWidth: 0 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 24,
  },
  choice: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
  },
  wrongRow: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
}));

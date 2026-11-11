import { ComponentRef, useRef } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Btn, IconButton } from '../components/Bits';
import { Txt } from '../components/Txt';
import { deckMeta } from '../data/decks';
import { dialogues } from '../data/dialogues';
import { Progress } from '../progress';
import { colors, createStyles } from '../theme';

const CARD_H = 160;
const GAP = 12;
const LABEL = (i: number, title: string, state: string) => `${i + 1}편 ${title} 암기, ${state}`;

type Props = {
  progress: Progress;
  onOpen: (index: number) => void;
  onBack: () => void;
};

// 대화문 한 편마다 카드 하나: 영단어·구동사·문장 덱의 세트 목록과 같은 모양
export function DialogueListScreen({ progress, onOpen, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const meta = deckMeta('dialogue');
  const { round, pos } = progress.dialogue;
  const done = new Set(progress.dialogue.done);

  // 이어서 할 대화문 카드가 보이는 위치에서 시작한다. 글자가 커져 카드 높이가 달라져도 실제 위치를 쓴다
  const scrolled = useRef(false);
  const onCurrentLayout = (y: number) => {
    if (scrolled.current) return;
    scrolled.current = true;
    scroll.current?.scrollTo({ y: Math.max(0, y - 8), animated: false });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.header}>
        <IconButton label="덱 목록으로" onPress={onBack} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={16} weight={600}>
            {meta.name}
          </Txt>
          <Txt size={12} color={colors.muted}>
            {`${round}회독 · ${dialogues.length}편`}
          </Txt>
        </View>
        <Txt size={15} weight={600} tabular>
          {`${done.size} / ${dialogues.length}`}
        </Txt>
      </View>
      <Bar pct={(done.size / dialogues.length) * 100} color={meta.color} track={colors.border} height={6} />

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ gap: GAP }} showsVerticalScrollIndicator={false}>
        {dialogues.map((d, i) => {
          const finished = done.has(i);
          const state = finished ? '완료' : i === pos ? '이어서' : '미완료';
          return (
            <View
              key={d.id}
              onLayout={i === pos ? (e) => onCurrentLayout(e.nativeEvent.layout.y) : undefined}
              style={[
                styles.card,
                finished && { backgroundColor: meta.soft, borderColor: meta.soft },
                i === pos && { borderColor: meta.color, borderWidth: 2 },
              ]}
            >
              <View style={styles.top}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
                  <Txt size={30} weight={700} color={finished ? meta.deep : colors.ink} tabular style={{ letterSpacing: -0.9 }}>
                    {String(i + 1)}
                  </Txt>
                  <Txt size={16} weight={600} numberOfLines={2} style={{ flex: 1 }}>
                    {d.title}
                  </Txt>
                </View>
                <Txt size={12} weight={500} color={colors.muted}>
                  {finished ? '완료' : i === pos ? '이어서' : `${d.lines.length}줄`}
                </Txt>
              </View>
              <Txt size={12} color={colors.muted} numberOfLines={1}>
                {d.expressions.join(' · ')}
              </Txt>
              <Btn label="암기" accessibilityLabel={LABEL(i, d.title, state)} primary accent={colors.ink} height={38} size={15} onPress={() => onOpen(i)} style={{ borderWidth: 0 }} />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    minHeight: CARD_H,
    justifyContent: 'space-between',
    gap: 8,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
}));

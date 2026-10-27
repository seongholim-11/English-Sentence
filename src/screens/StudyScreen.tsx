import * as Speech from 'expo-speech';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Btn, Chip, DashedLine, IconButton } from '../components/Bits';
import { AgainIcon, CheckIcon, SpeakerIcon, TapIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { CardDeckId, cardDecks, deckMeta, speakText } from '../data/decks';
import { colors } from '../theme';

type Props = {
  deck: CardDeckId;
  title: string;
  subtitle: string;
  queue: string[];
  pos: number;
  revealed: boolean;
  onToggle: () => void;
  onMark: (knew: boolean) => void;
  onBack: () => void;
};

export function StudyScreen({ deck, title, subtitle, queue, pos, revealed, onToggle, onMark, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const meta = deckMeta(deck);
  const cards = cardDecks[deck];
  const card = cards.find((c) => c.id === queue[pos]) ?? cards[0];
  const total = queue.length;
  // 문장 덱은 앞면이 한국어라 뜻을 본 뒤에만 영어를 읽어 준다
  const canSpeak = deck !== 'sentences' || revealed;

  const speak = () => {
    Speech.stop();
    Speech.speak(speakText(deck, card), { language: 'en-US', rate: 0.9 });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 30) }]}>
      <View style={styles.header}>
        <IconButton label="뒤로" onPress={onBack} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={16} weight={600}>
            {title}
          </Txt>
          <Txt size={12} color={colors.muted}>
            {subtitle}
          </Txt>
        </View>
        <Txt size={15} weight={600} tabular>
          {`${pos + 1} / ${total}`}
        </Txt>
      </View>
      <Bar pct={(pos / total) * 100} color={colors.accent} track={colors.border} height={6} />

      <Pressable accessibilityRole="button" accessibilityLabel="카드 뒤집기" onPress={onToggle} style={styles.card}>
        <View style={styles.cardTop}>
          <Chip label={card.tag} bg={meta.soft} fg={meta.deep} />
          {canSpeak && (
            <Pressable accessibilityRole="button" accessibilityLabel="발음 듣기" onPress={speak} hitSlop={8} style={styles.speak}>
              <SpeakerIcon />
            </Pressable>
          )}
        </View>
        <View style={styles.front}>
          <Txt size={meta.bigFront ? 44 : 28} weight={700} lineHeight={1.2} style={{ letterSpacing: meta.bigFront ? -0.88 : -0.56 }}>
            {card.front}
          </Txt>
          <Txt size={14} color={colors.muted}>
            {card.hint}
          </Txt>
        </View>
        {revealed ? (
          <View style={{ gap: 12 }}>
            <DashedLine />
            <View style={{ gap: 12, paddingTop: 6 }}>
              <Txt size={22} weight={600} lineHeight={1.35}>
                {card.back}
              </Txt>
              <View style={styles.example}>
                <Txt size={15} lineHeight={1.45}>
                  {card.ex}
                </Txt>
                <Txt size={13} lineHeight={1.45} color={colors.muted}>
                  {card.exKo}
                </Txt>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.tapHint}>
            <TapIcon />
            <Txt size={13} color={colors.muted}>
              탭해서 뜻 보기
            </Txt>
          </View>
        )}
      </Pressable>

      <View style={styles.actions}>
        <Btn label="다시 볼래요" onPress={() => onMark(false)} icon={<AgainIcon />} style={{ flex: 1 }} />
        <Btn label="알아요" primary onPress={() => onMark(true)} icon={<CheckIcon />} style={{ flex: 1, borderWidth: 0 }} />
      </View>
      <Txt size={12} color={colors.muted} style={{ textAlign: 'center' }}>
        다시 볼 카드만 다음 회독에 남아요
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 24,
    gap: 16,
    boxShadow: '0 12px 32px rgba(21,23,28,0.06)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  speak: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.exampleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  front: { flex: 1, justifyContent: 'center', gap: 10 },
  example: { gap: 4, padding: 14, borderRadius: 16, backgroundColor: colors.exampleBg },
  tapHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  actions: { flexDirection: 'row', gap: 10 },
});

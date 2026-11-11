import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Btn, Chip, DashedLine, IconButton } from '../components/Bits';
import { AgainIcon, CheckIcon, SpeakerIcon, StarIcon, TapIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { CardDeckId, cardDecks, deckMeta, speakText } from '../data/decks';
import { speak as say } from '../speech';
import { colors, createStyles } from '../theme';

type Props = {
  deck: CardDeckId;
  title: string;
  subtitle: string;
  queue: string[];
  pos: number;
  revealed: boolean;
  rate: number;
  autoSpeak: boolean;
  isFavorite: (id: string) => boolean;
  onFavorite: (id: string) => void;
  onToggle: () => void;
  onMark: (knew: boolean) => void;
  // 직전에 채점한 카드가 있으면 되돌릴 수 있다
  canUndo: boolean;
  onUndo: () => void;
  onBack: () => void;
};

export function StudyScreen({ deck, title, subtitle, queue, pos, revealed, rate, autoSpeak, isFavorite, onFavorite, onToggle, onMark, canUndo, onUndo, onBack }: Props) {
  const insets = useSafeAreaInsets();
  // 작은 화면(iPhone SE급)에서는 글자·버튼을 줄이고 아이콘을 뺀다
  const { width, height } = useWindowDimensions();
  const compact = height < 700 || width < 360;
  const meta = deckMeta(deck);
  const cards = cardDecks[deck];
  const card = cards.find((c) => c.id === queue[pos]) ?? cards[0];
  const total = queue.length;
  // 문장 덱은 앞면이 한국어라 뜻을 본 뒤에만 영어를 읽어 준다
  const canSpeak = deck !== 'sentences' || revealed;

  // 예문은 영단어·구동사 덱에만 있다 (문장 덱의 ex는 힌트)
  const hasExample = deck !== 'sentences';

  const speakExample = () => say(card.ex, rate);

  const speak = () => {
    say(speakText(deck, card), rate);
  };

  // 자동 재생: 카드가 바뀌면 읽어 준다 (문장은 영어가 보이는 뜻 보기 뒤에)
  useEffect(() => {
    if (autoSpeak && canSpeak) speak();
  }, [card.id, canSpeak]);

  return (
    <View style={[styles.root, compact && { gap: 10 }, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, compact ? 16 : 30) }]}>
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

      <View style={[styles.card, compact && { padding: 14, gap: 8 }]}>
        <View style={styles.cardTop}>
          <Chip label={card.tag} bg={meta.soft} fg={meta.deep} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {canUndo && (
            <Pressable accessibilityRole="button" accessibilityLabel="직전 채점 취소" onPress={onUndo} hitSlop={4} style={styles.star}>
              <AgainIcon size={20} color={colors.muted} />
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite(card.id) ? '즐겨찾기 해제' : '즐겨찾기'}
            onPress={() => onFavorite(card.id)}
            hitSlop={4}
            style={styles.star}
          >
            <StarIcon size={22} filled={isFavorite(card.id)} color={isFavorite(card.id) ? '#F2A91B' : colors.muted} />
          </Pressable>
          </View>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tapArea}>
        <Pressable accessibilityRole="button" accessibilityHint={revealed ? '누르면 카드를 다시 가려요' : '누르면 뜻과 예문을 보여 줘요'} onPress={onToggle} style={styles.tapContent}>
        <View style={styles.front}>
          <Txt size={meta.bigFront ? (compact ? 36 : 44) : compact ? 24 : 28} weight={700} lineHeight={1.2} style={{ letterSpacing: meta.bigFront ? -0.88 : -0.56 }}>
            {card.front}
          </Txt>
          {compact && revealed ? null : (
            <Txt size={14} color={colors.muted}>
              {card.hint}
            </Txt>
          )}
        </View>
        {revealed ? (
          <View style={{ gap: compact ? 8 : 12 }}>
            <DashedLine />
            <View style={{ gap: compact ? 8 : 12, paddingTop: compact ? 0 : 6 }}>
              <Txt size={compact ? 19 : 22} weight={600} lineHeight={1.35}>
                {card.back}
              </Txt>
            </View>
          </View>
        ) : null}
        </Pressable>
        {revealed ? <View style={{ paddingTop: compact ? 8 : 12 }}>
          <View style={styles.example}>
            <View style={styles.exampleText}>
              <Txt size={compact ? 14 : 15} lineHeight={1.4}>
                {card.ex}
              </Txt>
              <Txt size={compact ? 12 : 13} lineHeight={1.4} color={colors.muted}>
                {card.exKo}
              </Txt>
            </View>
            {hasExample ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="예문 듣기"
                hitSlop={6}
                onPress={speakExample}
                style={({ pressed }) => [styles.exampleBtn, pressed && { opacity: 0.8 }]}
              >
                <SpeakerIcon size={20} color={colors.accent} />
              </Pressable>
            ) : null}
          </View>
        </View> : null}
        <Pressable accessible={false} focusable={false} onPress={onToggle} style={{ flexGrow: 1 }} />
        </View>
        </ScrollView>
        <View style={styles.cardButtons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="영어 발음 듣기"
              accessibilityHint={canSpeak ? undefined : '뜻을 본 뒤에 들을 수 있어요'}
              accessibilityState={{ disabled: !canSpeak }}
              disabled={!canSpeak}
              onPress={speak}
              style={({ pressed }) => [styles.listen, !canSpeak && { opacity: 0.45 }, pressed && { opacity: 0.8 }]}
            >
              <SpeakerIcon size={compact ? 20 : 24} color={colors.accent} />
              <Txt size={compact ? 15 : 16} weight={600} color={colors.accent} numberOfLines={1}>
                {compact ? '듣기' : '발음 듣기'}
              </Txt>
            </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onToggle}
            style={({ pressed }) => [styles.listen, styles.reveal, pressed && { opacity: 0.8 }]}
          >
            {compact ? null : <TapIcon />}
            <Txt size={compact ? 15 : 16} weight={600} color={colors.ink} numberOfLines={1}>
              {revealed ? '뜻 숨기기' : '뜻 보기'}
            </Txt>
          </Pressable>
        </View>
      </View>

      <View style={styles.actions}>
        <Btn label="다시 볼래요" onPress={() => onMark(false)} icon={compact ? undefined : <AgainIcon />} height={compact ? 50 : 58} size={compact ? 15 : 16} style={{ flex: 1 }} />
        <Btn label="알아요" primary onPress={() => onMark(true)} icon={compact ? undefined : <CheckIcon />} height={compact ? 50 : 58} size={compact ? 15 : 16} style={{ flex: 1, borderWidth: 0 }} />
      </View>
      {compact ? null : (
        <Txt size={12} color={colors.muted} style={{ textAlign: 'center' }}>
          다시 볼 카드만 다음 회독에 남아요
        </Txt>
      )}
    </View>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 20,
    gap: 12,
    boxShadow: '0 12px 32px rgba(21,23,28,0.06)',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  star: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.exampleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listen: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: colors.accentTint,
  },
  // 내용이 짧으면 스크롤 없이 카드를 채우고, 길어서 넘칠 때만 스크롤된다
  scroll: { flex: 1, minHeight: 0 },
  scrollContent: { flexGrow: 1 },
  tapArea: { flexGrow: 1 },
  tapContent: { gap: 12 },
  reveal: { backgroundColor: colors.exampleBg },
  cardButtons: { flexDirection: 'row', gap: 8 },
  front: { flex: 1, justifyContent: 'center', gap: 10 },
  example: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, backgroundColor: colors.exampleBg },
  exampleText: { flex: 1, minWidth: 0, gap: 4 },
  exampleBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentTint },
  actions: { flexDirection: 'row', gap: 10 },
}));

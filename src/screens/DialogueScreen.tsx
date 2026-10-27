import * as Speech from 'expo-speech';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, IconButton } from '../components/Bits';
import { Txt } from '../components/Txt';
import { Dialogue, Line } from '../data/dialogues';
import { colors } from '../theme';

export type HideMode = 'en' | 'ko' | 'none';

const HIDE_OPTIONS: { id: HideMode; label: string }[] = [
  { id: 'en', label: '영어 가리기' },
  { id: 'ko', label: '한국어 가리기' },
  { id: 'none', label: '모두 보기' },
];

type Props = {
  dialogue: Dialogue;
  index: number;
  count: number;
  round: number;
  hide: HideMode;
  shown: Record<number, boolean>;
  onHide: (mode: HideMode) => void;
  onToggleLine: (i: number) => void;
  onReset: () => void;
  onDone: () => void;
  onHome: () => void;
  rate: number;
};

export function DialogueScreen(props: Props) {
  const { dialogue, index, count, round, hide, shown, onHide, onToggleLine, onReset, onDone, onHome, rate } = props;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 30) }]}>
      <View style={styles.header}>
        <IconButton label="홈으로" onPress={onHome} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt size={16} weight={600}>
            {dialogue.title}
          </Txt>
          <Txt size={12} color={colors.muted}>
            {`대화문 · ${round}회독 · ${dialogue.lines.length}줄`}
          </Txt>
        </View>
        <Txt size={15} weight={600} tabular>
          {`${index + 1} / ${count}`}
        </Txt>
      </View>

      <View accessibilityRole="radiogroup" accessibilityLabel="가리기 방식" style={styles.segment}>
        {HIDE_OPTIONS.map((o) => {
          const on = o.id === hide;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => onHide(o.id)}
              style={[styles.segBtn, on && styles.segOn]}
            >
              <Txt size={13} weight={600} color={on ? colors.ink : colors.muted}>
                {o.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.lines}>
        {dialogue.lines.map((l, i) => (
          <Bubble key={`${dialogue.id}-${i}`} line={l} open={!!shown[i]} hide={hide} rate={rate} onPress={() => onToggleLine(i)} />
        ))}
        <View style={styles.expr}>
          <Txt size={13} weight={600} color={colors.muted}>
            이 대화의 표현
          </Txt>
          <View style={styles.exprList}>
            {dialogue.expressions.map((e) => (
              <View key={e} style={styles.exprChip}>
                <Txt size={14} weight={500}>
                  {e}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Btn label="다시 가리기" height={56} size={15} onPress={onReset} style={{ flex: 1 }} />
        <Btn label="다 외웠어요" height={56} size={15} primary onPress={onDone} style={{ flex: 1, borderWidth: 0 }} />
      </View>
    </View>
  );
}

function Bubble({ line, open, hide, rate, onPress }: { line: Line; open: boolean; hide: HideMode; rate: number; onPress: () => void }) {
  const isA = line.who === 'A';
  const showEn = open || hide !== 'en';
  const showKo = open || hide !== 'ko';

  // 누른 뒤에 영어가 보이는 상태라면 발음도 들려준다
  const press = () => {
    if (!open || hide !== 'en') {
      Speech.stop();
      Speech.speak(line.en, { language: 'en-US', rate });
    }
    onPress();
  };

  return (
    <View style={{ alignItems: isA ? 'flex-start' : 'flex-end', gap: 4 }}>
      <Txt size={11} weight={600} color={colors.muted} style={isA ? { paddingLeft: 4 } : { paddingRight: 4 }}>
        {line.speaker}
      </Txt>
      <Pressable
        accessibilityRole="button"
        onPress={press}
        style={[styles.bubble, isA ? styles.bubbleA : styles.bubbleB]}
      >
        {showEn ? (
          <Txt size={15} weight={500} lineHeight={1.4} color={isA ? colors.ink : colors.white}>
            {line.en}
          </Txt>
        ) : (
          <Hidden label="영어 문장 · 탭해서 보기" dark={!isA} size={13} />
        )}
        {showKo ? (
          <Txt size={13} lineHeight={1.4} color={isA ? colors.muted : colors.heroSub}>
            {line.ko}
          </Txt>
        ) : (
          <Hidden label="한국어 · 탭해서 보기" dark={!isA} size={12} />
        )}
      </Pressable>
    </View>
  );
}

function Hidden({ label, dark, size }: { label: string; dark: boolean; size: number }) {
  return (
    <View style={[styles.hidden, dark ? styles.hiddenDark : styles.hiddenLight, { paddingVertical: size === 13 ? 4 : 3 }]}>
      <Txt size={size} lineHeight={1.4} color={dark ? colors.onDarkHint : colors.muted}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.segment },
  segBtn: { flex: 1, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.white, boxShadow: '0 1px 3px rgba(21,23,28,0.12)' },
  lines: { gap: 12, paddingVertical: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  bubble: { maxWidth: '82%', paddingVertical: 12, paddingHorizontal: 14, gap: 4 },
  bubbleA: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  bubbleB: {
    backgroundColor: colors.ink,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  hidden: { paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', alignSelf: 'flex-start' },
  hiddenLight: { backgroundColor: colors.hiddenBg, borderColor: colors.hiddenBorder },
  hiddenDark: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.28)' },
  expr: { gap: 8, paddingTop: 8 },
  exprList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exprChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
});

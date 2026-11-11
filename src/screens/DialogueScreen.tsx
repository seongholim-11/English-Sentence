import { ComponentRef, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, IconButton } from '../components/Bits';
import { SpeakerIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { Dialogue, Line } from '../data/dialogues';
import { explainExpression } from '../data/expressions';
import { speak, stopSpeech } from '../speech';
import { colors, createStyles } from '../theme';

export type HideMode = 'en' | 'ko' | 'none';

const HIDE_OPTIONS: { id: HideMode; label: string; short: string }[] = [
  { id: 'en', label: '영어 가리기', short: '영어 가림' },
  { id: 'ko', label: '한국어 가리기', short: '한글 가림' },
  { id: 'none', label: '모두 보기', short: '모두 보기' },
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
  onBack: () => void;
  rate: number;
};

// 전체 듣기에서 줄과 줄 사이 쉬는 시간, 한 줄이 이만큼 지나도 안 끝나면 다음 줄로 넘어간다
const LINE_GAP_MS = 400;
const LINE_MAX_MS = 20000;

export function DialogueScreen(props: Props) {
  const { dialogue, index, count, round, hide, shown, onHide, onToggleLine, onReset, onDone, onBack, rate } = props;
  const insets = useSafeAreaInsets();
  // 좁은 화면에서는 가리기 버튼 문구를 줄여 한 줄에 담는다
  const compact = useWindowDimensions().width < 360;

  // 전체 듣기: 지금 읽는 줄 번호 (읽는 중이 아니면 null)
  const [playing, setPlaying] = useState<number | null>(null);
  const run = useRef(0);
  const gap = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const ys = useRef<Record<number, number>>({});

  // 눌러서 설명을 펼친 표현
  const [picked, setPicked] = useState<string | null>(null);
  const info = picked ? explainExpression(picked) : null;
  const pickExpression = (e: string) => {
    if (playing !== null) {
      stopAll();
      stopSpeech();
    }
    setPicked((cur) => (cur === e ? null : e));
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 60);
  };
  const hear = (text: string) => {
    if (playing !== null) stopAll();
    speak(text, rate);
  };

  const stopAll = () => {
    run.current++;
    if (gap.current) clearTimeout(gap.current);
    gap.current = null;
    setPlaying(null);
  };

  const playFrom = (i: number, id: number) => {
    if (id !== run.current) return;
    if (i >= dialogue.lines.length) {
      setPlaying(null);
      return;
    }
    const line = dialogue.lines[i];
    setPlaying(i);
    if (gap.current) clearTimeout(gap.current);
    gap.current = setTimeout(() => playFrom(i + 1, id), LINE_MAX_MS);
    scroll.current?.scrollTo({ y: Math.max(0, (ys.current[i] ?? 0) - 12), animated: true });
    speak(line.en, rate, line.who === 'A' ? 'main' : 'alt', () => {
      if (id !== run.current) return;
      if (gap.current) clearTimeout(gap.current);
      gap.current = setTimeout(() => playFrom(i + 1, id), LINE_GAP_MS);
    });
  };

  const togglePlayAll = () => {
    if (playing !== null) {
      stopAll();
      stopSpeech();
      return;
    }
    run.current++;
    playFrom(0, run.current);
  };

  // 다른 대화문으로 넘어가거나 화면을 나가면 읽기를 멈춘다
  useEffect(() => {
    // 새 대화문은 맨 위에서 시작한다
    scroll.current?.scrollTo({ y: 0, animated: false });
    ys.current = {};
    return () => {
      run.current++;
      if (gap.current) clearTimeout(gap.current);
      gap.current = null;
      setPlaying(null);
      setPicked(null);
    };
  }, [dialogue.id]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 30) }]}>
      <View style={styles.header}>
        <IconButton label="대화문 목록으로" onPress={onBack} />
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

      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={styles.lines}>
        {dialogue.lines.map((l, i) => (
          <View key={`${dialogue.id}-${i}`} onLayout={(e) => (ys.current[i] = e.nativeEvent.layout.y)}>
            <Bubble line={l} open={!!shown[i]} hide={hide} rate={rate} active={playing === i} onPress={() => onToggleLine(i)} onTap={() => {
              if (playing === null) return;
              stopAll();
              stopSpeech();
            }} />
          </View>
        ))}
        <View style={styles.expr}>
          <Txt size={13} weight={600} color={colors.muted}>
            이 대화의 표현 · 눌러서 설명 보기
          </Txt>
          <View style={styles.exprList}>
            {dialogue.expressions.map((e) => {
              const on = e === picked;
              return (
                <Pressable
                  key={e}
                  accessibilityRole="button"
                  accessibilityLabel={`${e} 설명 보기`}
                  accessibilityState={{ expanded: on }}
                  hitSlop={4}
                  onPress={() => pickExpression(e)}
                  style={[styles.exprChip, on && styles.exprChipOn]}
                >
                  <Txt size={14} weight={500} color={on ? '#FFFFFF' : colors.ink}>
                    {e}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
          {picked && info ? (
            <View style={styles.exprCard}>
              <View style={styles.exprRow}>
                <Txt size={17} weight={700} style={{ flex: 1 }}>
                  {info.term}
                </Txt>
                <Pressable accessibilityRole="button" accessibilityLabel="표현 듣기" hitSlop={6} onPress={() => hear(info.term)} style={styles.exprSpeak}>
                  <SpeakerIcon size={18} color={colors.accent} />
                </Pressable>
              </View>
              <Txt size={15} lineHeight={1.4}>
                {info.meaning}
              </Txt>
              <View style={styles.exprEx}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size={14} lineHeight={1.4}>
                    {info.ex}
                  </Txt>
                  <Txt size={13} lineHeight={1.4} color={colors.muted}>
                    {info.exKo}
                  </Txt>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="예문 듣기" hitSlop={6} onPress={() => hear(info.ex)} style={styles.exprSpeak}>
                  <SpeakerIcon size={18} color={colors.accent} />
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={playing !== null ? `전체 듣기 멈추기, ${dialogue.lines.length}줄 중 ${playing + 1}번째 줄 읽는 중` : '전체 듣기'}
        onPress={togglePlayAll}
        style={({ pressed }) => [styles.playAll, playing !== null && styles.playAllOn, pressed && { opacity: 0.85 }]}
      >
        <SpeakerIcon size={18} color={playing !== null ? '#FFFFFF' : colors.accent} />
        <Txt size={14} weight={600} color={playing !== null ? '#FFFFFF' : colors.ink}>
          {playing !== null ? `멈추기 · ${playing + 1} / ${dialogue.lines.length}줄` : '전체 듣기'}
        </Txt>
      </Pressable>

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
              <Txt size={13} weight={600} color={on ? colors.ink : colors.muted} numberOfLines={2} style={{ textAlign: 'center' }}>
                {compact ? o.short : o.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Btn label="다시 가리기" height={42} size={15} onPress={onReset} style={{ flex: 1 }} />
        <Btn label="다 외웠어요" height={42} size={15} primary onPress={onDone} style={{ flex: 1, borderWidth: 0 }} />
      </View>
    </View>
  );
}

function Bubble({ line, open, hide, rate, active, onPress, onTap }: { line: Line; open: boolean; hide: HideMode; rate: number; active: boolean; onPress: () => void; onTap: () => void }) {
  const isA = line.who === 'A';
  const showEn = open || hide !== 'en';
  const showKo = open || hide !== 'ko';

  // 누른 뒤에 영어가 보이는 상태라면 발음도 들려준다
  const press = () => {
    onTap();
    if (!open || hide !== 'en') {
      // 상대방(A)은 기본 목소리, 나(B)는 다른 목소리로 번갈아 읽는다
      speak(line.en, rate, isA ? 'main' : 'alt');
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
        accessibilityState={{ selected: active }}
        onPress={press}
        style={[styles.bubble, isA ? styles.bubbleA : styles.bubbleB, active && styles.bubbleActive]}
      >
        {showEn ? (
          <Txt size={15} weight={500} lineHeight={1.4} color={isA ? colors.ink : colors.onHero}>
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

const styles = createStyles(() => ({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  segment: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 14, backgroundColor: colors.segment },
  segBtn: { flex: 1, minHeight: 34, paddingVertical: 6, paddingHorizontal: 4, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
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
    backgroundColor: colors.heroBg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  playAll: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playAllOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  bubbleActive: { outlineWidth: 2, outlineStyle: 'solid', outlineColor: colors.accent, outlineOffset: 2 },
  hidden: { paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', alignSelf: 'flex-start' },
  hiddenLight: { backgroundColor: colors.hiddenBg, borderColor: colors.hiddenBorder },
  hiddenDark: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.28)' },
  expr: { gap: 8, paddingTop: 8 },
  exprList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exprChipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  exprCard: { gap: 8, padding: 14, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  exprRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exprEx: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  exprSpeak: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.track },
  exprChip: {
    minHeight: 34,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
}));

import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bar, Btn, Chip, IconButton } from '../components/Bits';
import { Txt } from '../components/Txt';
import { cardDecks, deckMeta } from '../data/decks';
import { RoundResult } from '../progress';
import { colors } from '../theme';

type Props = {
  result: RoundResult;
  onNext: () => void;
  onBack: () => void;
};

export function DoneScreen({ result, onNext, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const meta = deckMeta(result.deck);
  const againN = result.again.length;
  const pct = Math.round((result.known / result.total) * 100);
  const fronts = result.again.map((id) => cardDecks[result.deck].find((c) => c.id === id)?.front ?? id);

  const summary =
    `${result.total}장 중 ${result.known}장을 알고 있어요. ` +
    (againN > 0 ? `모르는 ${againN}장만 다음 회독에 다시 나와요.` : '이 덱은 한 바퀴 다 외웠어요.');
  const nextLabel =
    againN > 0 ? `다시 볼 ${againN}장으로 ${result.round + 1}회독 시작` : `처음부터 ${result.round + 1}회독 시작`;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 30) }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <IconButton label="세트 목록으로" kind="close" onPress={onBack} />
      </View>

      <View style={{ gap: 10 }}>
        <Chip label={`${meta.name} · ${result.set + 1}세트`} bg={meta.soft} fg={meta.deep} />
        <Txt size={38} weight={700} lineHeight={1.1} style={{ letterSpacing: -1.14 }}>
          {`${result.round}회독 완료`}
        </Txt>
        <Txt size={15} lineHeight={1.55} color={colors.muted}>
          {summary}
        </Txt>
      </View>

      <View style={styles.stats}>
        <Stat label="알아요" value={String(result.known)} />
        <Stat label="다시 볼 카드" value={String(againN)} />
        <Stat label="이번 정답률" value={`${pct}%`} />
      </View>

      <View style={{ gap: 8 }}>
        <Bar pct={pct} color={colors.accent} track={colors.borderStrong} height={10} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt size={12} color={colors.muted}>
            알아요
          </Txt>
          <Txt size={12} color={colors.muted}>
            다시 볼 카드
          </Txt>
        </View>
      </View>

      <View style={{ flex: 1, minHeight: 0, gap: 10 }}>
        <Txt size={15} weight={600}>
          다음 회독에 남는 카드
        </Txt>
        <ScrollView contentContainerStyle={styles.chips}>
          {fronts.map((f) => (
            <View key={f} style={styles.chip}>
              <Txt size={14} weight={500}>
                {f}
              </Txt>
            </View>
          ))}
          {againN === 0 && (
            <Txt size={14} color={colors.muted}>
              모든 카드를 알고 있어요. 처음부터 다시 돌려 보세요.
            </Txt>
          )}
        </ScrollView>
      </View>

      <View style={{ gap: 10 }}>
        <Btn label={nextLabel} primary onPress={onNext} style={{ borderWidth: 0 }} />
        <Btn
          label="세트 목록으로"
          height={52}
          size={15}
          onPress={onBack}
          style={{ backgroundColor: 'transparent', borderWidth: 0 }}
        />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Txt size={12} color={colors.muted}>
        {label}
      </Txt>
      <Txt size={28} weight={700} tabular>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, gap: 24 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
});

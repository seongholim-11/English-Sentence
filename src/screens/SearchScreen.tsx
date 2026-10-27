import * as Speech from 'expo-speech';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '../components/Bits';
import { SearchIcon, SpeakerIcon, StarIcon } from '../components/Icons';
import { Txt } from '../components/Txt';
import { CardDeckId, cardDecks, deckMeta, speakText } from '../data/decks';
import { Progress, isFavorite } from '../progress';
import { Hit, searchCards } from '../search';
import { colors, createStyles, fontScale } from '../theme';

type Props = {
  progress: Progress;
  initialFavorites: boolean;
  onToggleFavorite: (deck: CardDeckId, id: string) => void;
  onBack: () => void;
};

// 전체 카드 검색과 즐겨찾기 목록
export function SearchScreen({ progress, initialFavorites, onToggleFavorite, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [onlyFav, setOnlyFav] = useState(initialFavorites);
  const [open, setOpen] = useState<string | null>(null);

  const favHits = useMemo<Hit[]>(
    () =>
      progress.favorites.flatMap((k) => {
        const i = k.indexOf(':');
        const deck = k.slice(0, i) as CardDeckId;
        const card = cardDecks[deck].find((c) => c.id === k.slice(i + 1));
        return card ? [{ deck, card }] : [];
      }),
    [progress.favorites],
  );

  const q = query.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!onlyFav) return searchCards(query);
    return q ? favHits.filter((h) => `${h.card.front} ${h.card.back} ${h.card.ex} ${h.card.exKo}`.toLowerCase().includes(q)) : favHits;
  }, [onlyFav, query, favHits]);

  const speak = (h: Hit) => {
    Speech.stop();
    Speech.speak(speakText(h.deck, h.card), { language: 'en-US', rate: progress.prefs.speechRate });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20) }]}>
      <View style={styles.header}>
        <IconButton label="덱으로" onPress={onBack} />
        <View style={styles.input}>
          <View style={{ width: 18, height: 18 }}>
            <SearchIcon />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="단어, 뜻, 문장 검색"
            placeholderTextColor={colors.navMuted}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            style={styles.textInput}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <Tab label="전체 검색" on={!onlyFav} onPress={() => setOnlyFav(false)} />
        <Tab label={`즐겨찾기 ${progress.favorites.length}`} on={onlyFav} onPress={() => setOnlyFav(true)} />
      </View>

      <FlatList
        data={hits}
        extraData={`${colors.mode}-${fontScale.value}`}
        keyExtractor={(h) => `${h.deck}:${h.card.id}`}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 10, flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Txt size={15} color={colors.muted} style={{ textAlign: 'center' }}>
              {onlyFav
                ? '즐겨찾기한 카드가 없어요.\n학습 카드의 별을 눌러 모아 보세요.'
                : q
                  ? '검색 결과가 없어요.'
                  : '단어나 뜻, 문장 일부를 입력해 보세요.'}
            </Txt>
          </View>
        }
        renderItem={({ item }) => {
          const key = `${item.deck}:${item.card.id}`;
          const meta = deckMeta(item.deck);
          const expanded = open === key;
          const fav = isFavorite(progress, item.deck, item.card.id);
          return (
            <View style={styles.row}>
              <View style={styles.rowTop}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => setOpen(expanded ? null : key)}
                  style={({ pressed }) => [styles.rowMain, pressed && { opacity: 0.85 }]}
                >
                  <View style={[styles.dot, { backgroundColor: meta.color }]} />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt size={16} weight={600} numberOfLines={expanded ? undefined : 1}>
                      {item.card.front}
                    </Txt>
                    <Txt size={13} color={colors.muted} numberOfLines={expanded ? undefined : 1}>
                      {item.card.back}
                    </Txt>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={fav ? '즐겨찾기 해제' : '즐겨찾기'}
                  hitSlop={8}
                  onPress={() => onToggleFavorite(item.deck, item.card.id)}
                  style={styles.iconBtn}
                >
                  <StarIcon filled={fav} color={fav ? '#F2A91B' : colors.muted} />
                </Pressable>
              </View>
              {expanded && (
                <View style={styles.detail}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt size={14} lineHeight={1.45}>
                      {item.card.ex}
                    </Txt>
                    <Txt size={13} lineHeight={1.45} color={colors.muted}>
                      {item.card.exKo}
                    </Txt>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="발음 듣기" hitSlop={8} onPress={() => speak(item)} style={styles.iconBtn}>
                    <SpeakerIcon />
                  </Pressable>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

function Tab({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[styles.tab, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
    >
      <Txt size={13} weight={600} color={on ? colors.white : colors.ink}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1, paddingHorizontal: 20, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textInput: { flex: 1, minWidth: 0, fontSize: 15 * fontScale.value, color: colors.ink, fontFamily: 'IBMPlexSansKR_500Medium', paddingVertical: 0 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    padding: 14,
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.exampleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', padding: 12, borderRadius: 12, backgroundColor: colors.exampleBg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
}));

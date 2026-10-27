import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CardDeckId, DeckId, cardDecks, setCards, setCount } from './data/decks';
import { dialogues } from './data/dialogues';

// 한 세트의 현재 회독: queue는 이번 회독에 도는 카드 id 목록
export type RoundState = {
  round: number;
  queue: string[];
  pos: number;
  known: number;
  again: string[];
};

// 덱 안의 50장짜리 세트 하나
export type SetRef = { deck: CardDeckId; set: number };

export type Progress = {
  // 세트별 회독 상태. 키는 `${deck}:${set}`, 처음 열 때 만든다
  sets: Record<string, RoundState>;
  // 한 번이라도 '알아요'를 누른 카드 (홈·세트 진행률)
  mastered: Record<CardDeckId, string[]>;
  dialogue: { round: number; pos: number };
  lastDeck: DeckId;
  lastSet: SetRef | null;
  today: { date: string; count: number };
  streak: number;
  lastStudyDate: string | null;
};

const STORAGE_KEY = 'dasibom/progress/v1';
const CARD_DECKS = Object.keys(cardDecks) as CardDeckId[];

export const setKey = ({ deck, set }: SetRef) => `${deck}:${set}`;

const setIds = ({ deck, set }: SetRef) => setCards(deck, set).map((c) => c.id);

export const freshRound = (ref: SetRef, round: number, queue?: string[]): RoundState => ({
  round,
  queue: queue && queue.length > 0 ? queue : setIds(ref),
  pos: 0,
  known: 0,
  again: [],
});

export const roundState = (p: Progress, ref: SetRef): RoundState => p.sets[setKey(ref)] ?? freshRound(ref, 1);

export const dateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
};

const initialProgress = (): Progress => ({
  sets: {},
  mastered: Object.fromEntries(CARD_DECKS.map((d) => [d, []])) as unknown as Record<CardDeckId, string[]>,
  dialogue: { round: 1, pos: 0 },
  lastDeck: 'phrasal',
  lastSet: null,
  today: { date: dateKey(), count: 0 },
  streak: 0,
  lastStudyDate: null,
});

// 저장된 데이터에 지금 콘텐츠에 없는 카드·세트가 있으면 걸러 낸다.
// 세트로 나누기 전의 덱별 회독 상태(decks)는 버리고, 외운 카드와 연속 기록은 그대로 둔다.
const sanitize = (raw: Partial<Progress>): Progress => {
  const base = initialProgress();
  const p: Progress = { ...base, ...raw, sets: {}, mastered: { ...base.mastered } } as Progress;
  for (const deck of CARD_DECKS) {
    const ids = new Set(cardDecks[deck].map((c) => c.id));
    p.mastered[deck] = (raw.mastered?.[deck] ?? []).filter((id) => ids.has(id));
  }
  for (const [key, r] of Object.entries(raw.sets ?? {})) {
    const [deck, n] = key.split(':');
    const set = Number(n);
    if (!CARD_DECKS.includes(deck as CardDeckId) || !(set < setCount(deck as CardDeckId))) continue;
    const ref = { deck: deck as CardDeckId, set };
    const ids = new Set(setIds(ref));
    const queue = r.queue.filter((id) => ids.has(id));
    const again = r.again.filter((id) => ids.has(id));
    p.sets[key] =
      queue.length === 0 ? freshRound(ref, r.round) : { ...r, queue, again, pos: Math.min(r.pos, queue.length - 1) };
  }
  if (p.lastSet && !p.sets[setKey(p.lastSet)]) p.lastSet = null;
  if (p.lastDeck !== 'dialogue' && !CARD_DECKS.includes(p.lastDeck)) p.lastDeck = 'phrasal';
  p.dialogue = { ...base.dialogue, ...raw.dialogue };
  p.dialogue.pos = Math.min(p.dialogue.pos, dialogues.length - 1);
  if (p.today.date !== dateKey()) p.today = { date: dateKey(), count: 0 };
  return p;
};

// 하루에 한 번 이상 공부하면 연속 일수가 이어진다
const recordStudy = (p: Progress): Pick<Progress, 'today' | 'streak' | 'lastStudyDate'> => {
  const today = dateKey();
  const count = p.today.date === today ? p.today.count + 1 : 1;
  let streak = p.streak;
  if (p.lastStudyDate !== today) streak = p.lastStudyDate === yesterdayKey() ? p.streak + 1 : 1;
  return { today: { date: today, count }, streak, lastStudyDate: today };
};

export const visibleStreak = (p: Progress) =>
  p.lastStudyDate === dateKey() || p.lastStudyDate === yesterdayKey() ? p.streak : 0;

export const todayCount = (p: Progress) => (p.today.date === dateKey() ? p.today.count : 0);

export type RoundResult = SetRef & {
  round: number;
  total: number;
  known: number;
  again: string[];
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const ref = useRef<Progress | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((s) => (s ? sanitize(JSON.parse(s)) : initialProgress()))
      .catch(() => initialProgress())
      .then((p) => {
        ref.current = p;
        setProgress(p);
      });
  }, []);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    if (!ref.current) return;
    const next = fn(ref.current);
    ref.current = next;
    setProgress(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setLastDeck = useCallback((deck: DeckId) => update((p) => ({ ...p, lastDeck: deck })), [update]);

  const openSet = useCallback(
    (s: SetRef) =>
      update((p) => ({ ...p, lastDeck: s.deck, lastSet: s, sets: { ...p.sets, [setKey(s)]: roundState(p, s) } })),
    [update],
  );

  // 카드 한 장 채점. 회독이 끝나면 결과를 돌려주고 다음 회독을 준비해 둔다
  const mark = useCallback(
    (s: SetRef, knew: boolean): RoundResult | null => {
      const p = ref.current;
      if (!p) return null;
      const r = roundState(p, s);
      const id = r.queue[r.pos];
      const known = r.known + (knew ? 1 : 0);
      const again = knew ? r.again : r.again.concat([id]);
      const done = p.mastered[s.deck];
      const mastered = knew && !done.includes(id) ? done.concat([id]) : done;
      const finished = r.pos + 1 >= r.queue.length;
      const next = finished ? freshRound(s, r.round + 1, again) : { ...r, pos: r.pos + 1, known, again };
      update((cur) => ({
        ...cur,
        ...recordStudy(cur),
        sets: { ...cur.sets, [setKey(s)]: next },
        mastered: { ...cur.mastered, [s.deck]: mastered },
        lastDeck: s.deck,
        lastSet: s,
      }));
      return finished ? { ...s, round: r.round, total: r.queue.length, known, again } : null;
    },
    [update],
  );

  // 대화문 하나를 다 외우면 다음 대화문으로. 마지막이면 다음 회독
  const completeDialogue = useCallback((): boolean => {
    const p = ref.current;
    if (!p) return false;
    const finished = p.dialogue.pos + 1 >= dialogues.length;
    update((cur) => ({
      ...cur,
      ...recordStudy(cur),
      lastDeck: 'dialogue',
      dialogue: finished
        ? { round: cur.dialogue.round + 1, pos: 0 }
        : { round: cur.dialogue.round, pos: cur.dialogue.pos + 1 },
    }));
    return finished;
  }, [update]);

  return { progress, setLastDeck, openSet, mark, completeDialogue };
}

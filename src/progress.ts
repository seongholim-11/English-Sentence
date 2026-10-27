import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CardDeckId, DeckId, cardDecks } from './data/decks';
import { dialogues } from './data/dialogues';

// 한 덱의 현재 회독: queue는 이번 회독에 도는 카드 id 목록
export type RoundState = {
  round: number;
  queue: string[];
  pos: number;
  known: number;
  again: string[];
};

export type Progress = {
  decks: Record<CardDeckId, RoundState>;
  // 한 번이라도 '알아요'를 누른 카드 (홈 진행률)
  mastered: Record<CardDeckId, string[]>;
  dialogue: { round: number; pos: number };
  lastDeck: DeckId;
  today: { date: string; count: number };
  streak: number;
  lastStudyDate: string | null;
};

const STORAGE_KEY = 'dasibom/progress/v1';
const CARD_DECKS = Object.keys(cardDecks) as CardDeckId[];

const allIds = (deck: CardDeckId) => cardDecks[deck].map((c) => c.id);

export const freshRound = (deck: CardDeckId, round: number, queue?: string[]): RoundState => ({
  round,
  queue: queue && queue.length > 0 ? queue : allIds(deck),
  pos: 0,
  known: 0,
  again: [],
});

export const dateKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
};

const perDeck = <T,>(fn: (deck: CardDeckId) => T) =>
  Object.fromEntries(CARD_DECKS.map((d) => [d, fn(d)])) as Record<CardDeckId, T>;

const initialProgress = (): Progress => ({
  decks: perDeck((d) => freshRound(d, 1)),
  mastered: perDeck(() => []),
  dialogue: { round: 1, pos: 0 },
  lastDeck: 'phrasal',
  today: { date: dateKey(), count: 0 },
  streak: 0,
  lastStudyDate: null,
});

// 저장된 데이터에 지금 콘텐츠에 없는 카드 id가 있으면 걸러 낸다
const sanitize = (raw: Partial<Progress>): Progress => {
  const base = initialProgress();
  const p: Progress = { ...base, ...raw, decks: { ...base.decks }, mastered: { ...base.mastered } } as Progress;
  for (const deck of CARD_DECKS) {
    const ids = new Set(allIds(deck));
    const r = raw.decks?.[deck];
    if (r) {
      const queue = r.queue.filter((id) => ids.has(id));
      const again = r.again.filter((id) => ids.has(id));
      p.decks[deck] =
        queue.length === 0
          ? freshRound(deck, r.round)
          : { ...r, queue, again, pos: Math.min(r.pos, queue.length - 1) };
    } else {
      p.decks[deck] = base.decks[deck];
    }
    p.mastered[deck] = (raw.mastered?.[deck] ?? []).filter((id) => ids.has(id));
  }
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

export type RoundResult = {
  deck: CardDeckId;
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

  // 카드 한 장 채점. 회독이 끝나면 결과를 돌려주고 다음 회독을 준비해 둔다
  const mark = useCallback(
    (deck: CardDeckId, knew: boolean): RoundResult | null => {
      const p = ref.current;
      if (!p) return null;
      const r = p.decks[deck];
      const id = r.queue[r.pos];
      const known = r.known + (knew ? 1 : 0);
      const again = knew ? r.again : r.again.concat([id]);
      const mastered =
        knew && !p.mastered[deck].includes(id) ? p.mastered[deck].concat([id]) : p.mastered[deck];
      const finished = r.pos + 1 >= r.queue.length;
      const nextRound = finished ? freshRound(deck, r.round + 1, again) : { ...r, pos: r.pos + 1, known, again };
      update((cur) => ({
        ...cur,
        ...recordStudy(cur),
        decks: { ...cur.decks, [deck]: nextRound },
        mastered: { ...cur.mastered, [deck]: mastered },
        lastDeck: deck,
      }));
      return finished ? { deck, round: r.round, total: r.queue.length, known, again } : null;
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

  return { progress, setLastDeck, mark, completeDialogue };
}

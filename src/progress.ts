import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CardDeckId, DeckId, cardDecks, setCards, setCount } from './data/decks';
import { dialogues } from './data/dialogues';
import { DAILY_GOAL } from './theme';

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
  // 날짜별로 본 카드 수 (기록 화면). 최근 기록만 남긴다
  history: Record<string, number>;
  // 하루 목표 카드 수 (설정 화면에서 바꾼다)
  goal: number;
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

export const GOAL_MIN = 5;
export const GOAL_MAX = 200;
const clampGoal = (n: number) => Math.min(GOAL_MAX, Math.max(GOAL_MIN, Math.round(Number(n)) || DAILY_GOAL));

const HISTORY_DAYS = 90;

const initialProgress = (): Progress => ({
  sets: {},
  mastered: Object.fromEntries(CARD_DECKS.map((d) => [d, []])) as unknown as Record<CardDeckId, string[]>,
  dialogue: { round: 1, pos: 0 },
  lastDeck: 'phrasal',
  lastSet: null,
  today: { date: dateKey(), count: 0 },
  history: {},
  goal: DAILY_GOAL,
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
  p.history = { ...(raw.history ?? {}) };
  // 기록 화면이 생기기 전에 공부한 오늘 분량도 반영한다
  if (raw.today?.date === p.today.date) p.history[p.today.date] = Math.max(p.history[p.today.date] ?? 0, p.today.count);
  p.goal = clampGoal(raw.goal ?? DAILY_GOAL);
  return p;
};

// 하루에 한 번 이상 공부하면 연속 일수가 이어진다
const recordStudy = (p: Progress): Pick<Progress, 'today' | 'history' | 'streak' | 'lastStudyDate'> => {
  const today = dateKey();
  const count = p.today.date === today ? p.today.count + 1 : 1;
  let streak = p.streak;
  if (p.lastStudyDate !== today) streak = p.lastStudyDate === yesterdayKey() ? p.streak + 1 : 1;
  const history = { ...p.history, [today]: count };
  const keys = Object.keys(history).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - HISTORY_DAYS))) delete history[k];
  return { today: { date: today, count }, history, streak, lastStudyDate: today };
};

export const visibleStreak = (p: Progress) =>
  p.lastStudyDate === dateKey() || p.lastStudyDate === yesterdayKey() ? p.streak : 0;

// 오늘부터 거슬러 올라간 n일 (오래된 날 → 오늘 순)
export const recentDays = (p: Progress, n: number): { date: string; label: string; count: number }[] => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = dateKey(d);
    days.push({ date, label: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()], count: p.history[date] ?? 0 });
  }
  return days;
};

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

  const setGoal = useCallback((goal: number) => update((p) => ({ ...p, goal: clampGoal(goal) })), [update]);

  return { progress, setLastDeck, openSet, mark, completeDialogue, setGoal };
}

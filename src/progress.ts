import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CardDeckId, DeckId, applySetSize, cardDecks, setCards, setCount, validSetSize } from './data/decks';
import { dialogues } from './data/dialogues';
import { Reminder, defaultReminder } from './reminder';
import { DAILY_GOAL } from './theme';

// 한 세트의 현재 회독: queue는 이번 회독에 도는 카드 id 목록
export type RoundState = {
  round: number;
  queue: string[];
  pos: number;
  known: number;
  again: string[];
};

// 라이트너 상자 번호(0~5)와 다음 복습 날짜
// 설정 화면에서 바꾸는 값
export type Prefs = {
  // 발음 속도 (expo-speech rate)
  speechRate: number;
  // 카드를 넘기면 자동으로 읽어 주기
  autoSpeak: boolean;
  // 매일 복습 알림
  reminder: Reminder;
  // 화면 테마와 글자 크기 배율
  theme: 'system' | 'light' | 'dark';
  fontScale: number;
  // 한 세트의 카드 수 (SET_SIZES 중 하나)
  setSize: number;
};

export const SPEECH_RATES: { label: string; rate: number }[] = [
  { label: '느리게', rate: 0.7 },
  { label: '보통', rate: 0.9 },
  { label: '빠르게', rate: 1.1 },
];

export const FONT_SCALES: { label: string; scale: number }[] = [
  { label: '작게', scale: 0.9 },
  { label: '보통', scale: 1 },
  { label: '크게', scale: 1.12 },
  { label: '아주 크게', scale: 1.25 },
];

export const THEMES: { label: string; theme: Prefs['theme'] }[] = [
  { label: '시스템', theme: 'system' },
  { label: '라이트', theme: 'light' },
  { label: '다크', theme: 'dark' },
];

export const defaultPrefs = (): Prefs => ({ speechRate: 0.9, autoSpeak: false, reminder: defaultReminder(), theme: 'system', fontScale: 1, setSize: 50 });

export type CardState = { box: number; due: string };

// 덱 안의 50장짜리 세트 하나
export type SetRef = { deck: CardDeckId; set: number };

export type Progress = {
  // 세트별 회독 상태. 키는 `${deck}:${set}`, 처음 열 때 만든다
  sets: Record<string, RoundState>;
  // 한 번이라도 '알아요'를 누른 카드 (홈·세트 진행률)
  mastered: Record<CardDeckId, string[]>;
  // done: 이번 회독에서 외운 대화문 번호(0부터), pos: 이어서 할 차례 (아직 안 한 다음 편)
  dialogue: { round: number; pos: number; done: number[] };
  // 카드별 간격 복습 상태. 키는 `${deck}:${cardId}`
  cards: Record<string, CardState>;
  // 세트별 퀴즈 최고 점수. 키는 `${deck}:${set}`
  quiz: Record<string, { best: number; total: number }>;
  lastDeck: DeckId;
  lastSet: SetRef | null;
  today: { date: string; count: number };
  // 날짜별로 본 카드 수 (기록 화면). 최근 기록만 남긴다
  history: Record<string, number>;
  // 하루 목표 카드 수 (설정 화면에서 바꾼다)
  goal: number;
  prefs: Prefs;
  // 즐겨찾기한 카드. 키는 `${deck}:${cardId}`
  favorites: string[];
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

// 상자 번호별 복습 간격(일). 맞히면 한 칸 올라가고, 틀리면 0번으로 돌아와 오늘 다시 나온다
const INTERVALS = [0, 1, 3, 7, 14, 30];

const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

const cardKey = (deck: CardDeckId, id: string) => `${deck}:${id}`;

const graded = (cards: Progress['cards'], deck: CardDeckId, id: string, knew: boolean): Progress['cards'] => {
  const key = cardKey(deck, id);
  const box = knew ? Math.min((cards[key]?.box ?? 0) + 1, INTERVALS.length - 1) : 0;
  return { ...cards, [key]: { box, due: addDays(INTERVALS[box]) } };
};

// 오늘 복습할 카드 id (오래 밀린 순)
export const dueIds = (p: Progress, deck: CardDeckId): string[] => {
  const today = dateKey();
  const prefix = `${deck}:`;
  return Object.entries(p.cards)
    .filter(([k, c]) => k.startsWith(prefix) && c.due <= today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([k]) => k.slice(prefix.length));
};

export const isFavorite = (p: Progress, deck: CardDeckId, id: string) => p.favorites.includes(cardKey(deck, id));

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
  dialogue: { round: 1, pos: 0, done: [] },
  cards: {},
  quiz: {},
  lastDeck: 'phrasal',
  lastSet: null,
  today: { date: dateKey(), count: 0 },
  history: {},
  goal: DAILY_GOAL,
  prefs: defaultPrefs(),
  favorites: [],
  streak: 0,
  lastStudyDate: null,
});

// 저장된 값을 필드마다 검사해서 쓸 수 있는 것만 남기고, 깨진 필드는 기본값으로 되돌린다.
// 지금 콘텐츠에 없는 카드·세트도 걸러 낸다. 외운 카드와 연속 기록은 가능한 한 그대로 둔다.
const isObj = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const isInt = (x: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): x is number =>
  typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;
const strList = (x: unknown): string[] => (Array.isArray(x) ? x.filter((v): v is string => typeof v === 'string') : []);
const uniq = <T,>(a: T[]): T[] => Array.from(new Set(a));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isDeck = (d: unknown): d is CardDeckId => typeof d === 'string' && CARD_DECKS.includes(d as CardDeckId);

export const sanitize = (rawIn: unknown): Progress => {
  const raw: Record<string, unknown> = isObj(rawIn) ? rawIn : {};
  const rawPrefs: Record<string, unknown> = isObj(raw.prefs) ? raw.prefs : {};
  // 세트 번호는 세트 크기에 따라 달라지므로, 세트를 걸러 내기 전에 저장된 크기부터 적용한다
  applySetSize(rawPrefs.setSize);
  const p = initialProgress();
  const cardIds = Object.fromEntries(CARD_DECKS.map((d) => [d, new Set(cardDecks[d].map((c) => c.id))])) as Record<CardDeckId, Set<string>>;

  const rawMastered: Record<string, unknown> = isObj(raw.mastered) ? raw.mastered : {};
  for (const deck of CARD_DECKS) p.mastered[deck] = uniq(strList(rawMastered[deck]).filter((id) => cardIds[deck].has(id)));

  if (isObj(raw.sets)) {
    for (const [key, r] of Object.entries(raw.sets)) {
      const [deck, n] = key.split(':');
      const set = Number(n);
      if (!isDeck(deck) || !Number.isInteger(set) || set < 0 || set >= setCount(deck) || !isObj(r)) continue;
      const ref = { deck, set };
      const ids = new Set(setIds(ref));
      const round = isInt(r.round, 1) ? r.round : 1;
      const queue = strList(r.queue).filter((id) => ids.has(id));
      if (queue.length === 0) {
        p.sets[key] = freshRound(ref, round);
        continue;
      }
      p.sets[key] = {
        round,
        queue,
        pos: Math.min(isInt(r.pos) ? r.pos : 0, queue.length - 1),
        known: Math.min(isInt(r.known) ? r.known : 0, queue.length),
        again: strList(r.again).filter((id) => ids.has(id)),
      };
    }
  }

  if (isObj(raw.cards)) {
    for (const [key, c] of Object.entries(raw.cards)) {
      const i = key.indexOf(':');
      const deck = key.slice(0, i);
      if (!isDeck(deck) || !cardIds[deck].has(key.slice(i + 1)) || !isObj(c)) continue;
      p.cards[key] = {
        box: isInt(c.box, 0, INTERVALS.length - 1) ? c.box : 0,
        due: typeof c.due === 'string' && DATE_RE.test(c.due) ? c.due : dateKey(),
      };
    }
  }

  if (isObj(raw.quiz)) {
    for (const [key, q] of Object.entries(raw.quiz)) {
      const [deck, n] = key.split(':');
      if (!isDeck(deck) || !Number.isInteger(Number(n)) || !(Number(n) < setCount(deck)) || !isObj(q)) continue;
      if (isInt(q.best) && isInt(q.total, 1) && q.best <= q.total) p.quiz[key] = { best: q.best, total: q.total };
    }
  }

  const ls = isObj(raw.lastSet) ? raw.lastSet : null;
  if (ls && isDeck(ls.deck) && isInt(ls.set) && p.sets[setKey({ deck: ls.deck, set: ls.set })]) p.lastSet = { deck: ls.deck, set: ls.set };
  p.lastDeck = raw.lastDeck === 'dialogue' || isDeck(raw.lastDeck) ? (raw.lastDeck as DeckId) : 'phrasal';

  const rd: Record<string, unknown> = isObj(raw.dialogue) ? raw.dialogue : {};
  const pos = isInt(rd.pos) ? Math.min(rd.pos, dialogues.length - 1) : 0;
  // 예전 저장본에는 done이 없다: 순서대로 pos 앞까지 외운 것으로 본다
  const doneList: unknown[] = Array.isArray(rd.done) ? rd.done : Array.from({ length: pos }, (_, i) => i);
  p.dialogue = {
    round: isInt(rd.round, 1) ? rd.round : 1,
    pos,
    done: uniq(doneList.filter((n): n is number => isInt(n, 0, dialogues.length - 1))),
  };

  const rt: Record<string, unknown> = isObj(raw.today) ? raw.today : {};
  const today = dateKey();
  p.today = rt.date === today && isInt(rt.count) ? { date: today, count: rt.count } : { date: today, count: 0 };
  if (isObj(raw.history)) {
    for (const [d, n] of Object.entries(raw.history)) if (DATE_RE.test(d) && isInt(n)) p.history[d] = n;
  }
  // 기록 화면이 생기기 전에 공부한 오늘 분량도 반영한다
  if (p.today.count > 0) p.history[today] = Math.max(p.history[today] ?? 0, p.today.count);

  p.goal = clampGoal(isInt(raw.goal) ? raw.goal : DAILY_GOAL);
  const rr: Record<string, unknown> = isObj(rawPrefs.reminder) ? rawPrefs.reminder : {};
  const dr = defaultReminder();
  p.prefs = {
    speechRate: SPEECH_RATES.some((x) => x.rate === rawPrefs.speechRate) ? (rawPrefs.speechRate as number) : 0.9,
    autoSpeak: rawPrefs.autoSpeak === true,
    reminder: {
      on: rr.on === true,
      hour: isInt(rr.hour, 0, 23) ? rr.hour : dr.hour,
      minute: isInt(rr.minute, 0, 59) ? rr.minute : dr.minute,
    },
    theme: THEMES.some((x) => x.theme === rawPrefs.theme) ? (rawPrefs.theme as Prefs['theme']) : 'system',
    fontScale: FONT_SCALES.some((x) => x.scale === rawPrefs.fontScale) ? (rawPrefs.fontScale as number) : 1,
    setSize: validSetSize(rawPrefs.setSize),
  };

  p.favorites = uniq(strList(raw.favorites)).filter((k) => {
    const i = k.indexOf(':');
    const deck = k.slice(0, i);
    return isDeck(deck) && cardIds[deck].has(k.slice(i + 1));
  });
  p.streak = isInt(raw.streak) ? raw.streak : 0;
  p.lastStudyDate = typeof raw.lastStudyDate === 'string' && DATE_RE.test(raw.lastStudyDate) ? raw.lastStudyDate : null;
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

const SAVE_RETRY_MS = 5000;

export type RoundResult = SetRef & {
  round: number;
  total: number;
  known: number;
  again: string[];
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const ref = useRef<Progress | null>(null);
  // 읽기 실패: 저장된 진도를 덮어쓰지 않도록 앱을 열지 않고 다시 시도하게 한다
  const [loadError, setLoadError] = useState(false);
  // 쓰기 실패: 화면에 알리고 자동·수동으로 다시 저장한다
  const [saveError, setSaveError] = useState(false);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveSeq = useRef(0);
  const mounted = useRef(true);

  // 저장된 기록이 심하게 깨져서 새로 시작했을 때 true (원본은 따로 보관해 둔다)
  const [resetNotice, setResetNotice] = useState(false);

  const load = useCallback(() => {
    setLoadError(false);
    AsyncStorage.getItem(STORAGE_KEY).then(
      (s) => {
        const open = (p: Progress) => {
          ref.current = p;
          setProgress(p);
        };
        let p: Progress;
        try {
          p = s ? sanitize(JSON.parse(s)) : initialProgress();
        } catch {
          // 저장값이 깨졌으면 원본을 먼저 따로 보관하고, 보관에 성공했을 때만 새로 시작한다
          AsyncStorage.setItem(`${STORAGE_KEY}.corrupt`, s ?? '').then(
            () => {
              open(initialProgress());
              setResetNotice(true);
            },
            () => setLoadError(true),
          );
          return;
        }
        open(p);
      },
      () => setLoadError(true),
    );
  }, []);

  useEffect(load, [load]);

  const save = useCallback((p: Progress) => {
    if (retryTimer.current) clearTimeout(retryTimer.current);
    retryTimer.current = null;
    // 가장 마지막에 요청한 저장의 결과만 반영한다 (이전 요청의 늦은 성공·실패는 무시)
    const seq = ++saveSeq.current;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(p)).then(
      () => {
        if (mounted.current && seq === saveSeq.current) setSaveError(false);
      },
      () => {
        if (!mounted.current || seq !== saveSeq.current) return;
        setSaveError(true);
        // 잠깐 뒤 가장 최신 진도로 한 번 더 시도한다
        retryTimer.current = setTimeout(() => ref.current && save(ref.current), SAVE_RETRY_MS);
      },
    );
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      if (!ref.current) return;
      const next = fn(ref.current);
      ref.current = next;
      setProgress(next);
      save(next);
    },
    [save],
  );

  const dismissResetNotice = useCallback(() => setResetNotice(false), []);

  const retrySave = useCallback(() => ref.current && save(ref.current), [save]);

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
        cards: graded(cur.cards, s.deck, id, knew),
        lastDeck: s.deck,
        lastSet: s,
      }));
      return finished ? { ...s, round: r.round, total: r.queue.length, known, again } : null;
    },
    [update],
  );

  // 홈의 복습 카드: 카드 한 장 채점 (세트 진행과는 따로)
  const review = useCallback(
    (deck: CardDeckId, id: string, knew: boolean) =>
      update((cur) => ({
        ...cur,
        ...recordStudy(cur),
        cards: graded(cur.cards, deck, id, knew),
        mastered:
          knew && !cur.mastered[deck].includes(id)
            ? { ...cur.mastered, [deck]: cur.mastered[deck].concat([id]) }
            : cur.mastered,
      })),
    [update],
  );

  // 퀴즈 한 문제: 간격 복습 상태와 오늘 본 카드 수에 반영
  const quizAnswer = useCallback(
    (deck: CardDeckId, id: string, correct: boolean) =>
      update((cur) => ({ ...cur, ...recordStudy(cur), cards: graded(cur.cards, deck, id, correct) })),
    [update],
  );

  const recordQuiz = useCallback(
    (s: SetRef, score: number, total: number) =>
      update((cur) => {
        const prev = cur.quiz[setKey(s)];
        const better = !prev || score / total > prev.best / prev.total;
        return better ? { ...cur, quiz: { ...cur.quiz, [setKey(s)]: { best: score, total } } } : cur;
      }),
    [update],
  );

  // 대화문 하나를 다 외웠다고 기록한다. 어느 편이든 상관없다.
  // 돌려주는 값: 이어서 할 다음 편 번호, 모든 편을 끝내 다음 회독이 시작되면 null
  const completeDialogue = useCallback((index: number): number | null => {
    const p = ref.current;
    if (!p) return null;
    const total = dialogues.length;
    const done = p.dialogue.done.includes(index) ? p.dialogue.done : p.dialogue.done.concat([index]);
    const finished = done.length >= total;
    let next = index;
    for (let i = 1; i < total; i++) {
      const c = (index + i) % total;
      if (!done.includes(c)) {
        next = c;
        break;
      }
    }
    update((cur) => ({
      ...cur,
      ...recordStudy(cur),
      lastDeck: 'dialogue',
      dialogue: finished ? { round: cur.dialogue.round + 1, pos: 0, done: [] } : { round: cur.dialogue.round, pos: next, done },
    }));
    return finished ? null : next;
  }, [update]);

  const setGoal = useCallback((goal: number) => update((p) => ({ ...p, goal: clampGoal(goal) })), [update]);

  const toggleFavorite = useCallback(
    (deck: CardDeckId, id: string) =>
      update((p) => {
        const key = cardKey(deck, id);
        return { ...p, favorites: p.favorites.includes(key) ? p.favorites.filter((k) => k !== key) : p.favorites.concat([key]) };
      }),
    [update],
  );

  // 세트 크기를 바꾸면 세트 번호가 달라지므로 세트별 회독 위치·퀴즈 최고점·마지막 세트는 비운다.
  // 외운 카드, 카드별 복습 일정, 연속 학습 기록은 카드 기준이라 그대로 남는다
  const setSetSize = useCallback(
    (n: number) => {
      applySetSize(n);
      update((p) => ({ ...p, prefs: { ...p.prefs, setSize: validSetSize(n) }, sets: {}, quiz: {}, lastSet: null }));
    },
    [update],
  );

  const setPrefs = useCallback((prefs: Partial<Prefs>) => update((p) => ({ ...p, prefs: { ...p.prefs, ...prefs } })), [update]);

  return { progress, loadError, saveError, resetNotice, dismissResetNotice, retryLoad: load, retrySave, toggleFavorite, setPrefs, setSetSize, setLastDeck, openSet, mark, review, quizAnswer, recordQuiz, completeDialogue, setGoal };
}

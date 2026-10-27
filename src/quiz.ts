import { Card, CardDeckId, cardDecks, setCards } from './data/decks';

// 퀴즈 한 문제. 뜻 고르기('meaning')와 빈칸 채우기('blank') 두 가지
export type Question = {
  card: Card;
  kind: 'meaning' | 'blank';
  prompt: string;
  hint: string;
  choices: string[];
  answer: number;
};

export const QUIZ_LENGTH = 10;

const STOP = new Set(
  'a an the and or but so if of to in on at for with from by as is are was were be been am do does did have has had i you he she it we they me my your his her our their this that these those not no can could will would should just very too than then there here what when where who how why about into over out up down off'.split(
    ' ',
  ),
);

const rand = (n: number) => Math.floor(Math.random() * n);

const shuffle = <T,>(a: T[]): T[] => {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const BLANK = '_____';

// 오답 보기: 같은 덱에서 뽑되, 정답과 겹치지 않게
const pick = (pool: Card[], n: number, ok: (c: Card) => boolean): Card[] => {
  const out: Card[] = [];
  for (let tries = 0; out.length < n && tries < 400; tries++) {
    const c = pool[rand(pool.length)];
    if (ok(c) && !out.includes(c)) out.push(c);
  }
  return out;
};

const finish = (card: Card, kind: Question['kind'], prompt: string, hint: string, right: string, wrong: string[]): Question => {
  const choices = shuffle([right, ...wrong]);
  return { card, kind, prompt, hint, choices, answer: choices.indexOf(right) };
};

const meaningQuestion = (deck: CardDeckId, card: Card): Question => {
  const pool = cardDecks[deck];
  const sameTag = (c: Card) => c.tag === card.tag && c.back !== card.back;
  let wrong = pick(pool, 3, sameTag);
  if (wrong.length < 3) wrong = wrong.concat(pick(pool, 3 - wrong.length, (c) => c.back !== card.back && !wrong.includes(c)));
  return finish(card, 'meaning', card.front, '알맞은 뜻을 고르세요', card.back, wrong.map((c) => c.back));
};

// 예문에서 카드의 단어·구동사를 비워 낸다. 활용형이면 못 찾으므로 null
const blankFromExample = (deck: CardDeckId, card: Card): Question | null => {
  const m = new RegExp(`(^|[^A-Za-z'])(${escape(card.front)})(?![A-Za-z'])`, 'i').exec(card.ex);
  if (!m) return null;
  const sentence = card.ex.replace(m[0], `${m[1]}${BLANK}`);
  const shape = (c: Card) => c.tag === card.tag && c.front !== card.front && c.front.split(' ').length === card.front.split(' ').length;
  const wrong = pick(cardDecks[deck], 3, shape).map((c) => c.front);
  if (wrong.length < 3) return null;
  return finish(card, 'blank', sentence, `${card.exKo} — 빈칸에 알맞은 말은?`, card.front, wrong);
};

// 문장 덱: 핵심 표현의 단어를 비운다
const blankFromSentence = (card: Card, others: Card[]): Question | null => {
  const sentence = card.back;
  const tokens = [...sentence.matchAll(/[A-Za-z]+(?:'[a-z]+)?/g)];
  const keys = card.ex
    .split('=')[0]
    .toLowerCase()
    .match(/[a-z]+/g)
    ?.filter((w) => w.length >= 3 && !STOP.has(w)) ?? [];
  const usable = tokens.filter((t) => t[0].length >= 4 && !STOP.has(t[0].toLowerCase()));
  const keyed = tokens.filter((t) => keys.includes(t[0].toLowerCase()));
  const best = (list: RegExpMatchArray[]) => list.slice().sort((a, b) => b[0].length - a[0].length)[0];
  const t = best(keyed) ?? best(usable);
  if (!t || t.index === undefined) return null;
  const word = t[0].toLowerCase();
  const wordPool = new Set<string>();
  for (const o of others) {
    for (const m of o.back.matchAll(/[A-Za-z]+(?:'[A-Za-z]+)?/g)) {
      const w = m[0].toLowerCase();
      if (w.includes("'")) continue;
      if (w.length >= 4 && !STOP.has(w) && w !== word && Math.abs(w.length - word.length) <= 2) wordPool.add(w);
    }
  }
  const wrong = shuffle([...wordPool]).slice(0, 3);
  if (wrong.length < 3) return null;
  const blanked = sentence.slice(0, t.index) + BLANK + sentence.slice(t.index + t[0].length);
  return finish(card, 'blank', blanked, `${card.front} — 빈칸에 알맞은 말은?`, word, wrong);
};

export function makeQuiz(deck: CardDeckId, set: number, n = QUIZ_LENGTH): Question[] {
  const cards = shuffle(setCards(deck, set)).slice(0, n);
  const pool = cardDecks[deck];
  return cards.map((card, i) => {
    if (deck === 'sentences') {
      const others = Array.from({ length: 30 }, () => pool[rand(pool.length)]).filter((c) => c !== card);
      return blankFromSentence(card, others) ?? meaningFallback(deck, card);
    }
    // 단어·구동사는 뜻 고르기와 빈칸 채우기를 번갈아 낸다
    return (i % 2 === 1 ? blankFromExample(deck, card) : null) ?? meaningQuestion(deck, card);
  });
}

// 비울 단어를 못 찾은 문장: 한국어를 보고 영어 문장 고르기
const meaningFallback = (deck: CardDeckId, card: Card): Question => {
  const wrong = pick(cardDecks[deck], 3, (c) => c.back !== card.back);
  return finish(card, 'meaning', card.front, '알맞은 영어 문장을 고르세요', card.back, wrong.map((c) => c.back));
};

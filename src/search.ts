import { Card, CardDeckId, cardDecks } from './data/decks';

export type Hit = { deck: CardDeckId; card: Card };

const DECKS = Object.keys(cardDecks) as CardDeckId[];

export const MAX_HITS = 60;

// 영어·한국어 어느 쪽으로 찾아도 된다. 앞면이 정확히 같거나 앞에서 시작하는 카드를 먼저 보여 준다
export function searchCards(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const first: Hit[] = [];
  const rest: Hit[] = [];
  for (const deck of DECKS) {
    for (const card of cardDecks[deck]) {
      const front = card.front.toLowerCase();
      if (front === q || front.startsWith(q)) first.push({ deck, card });
      else if (front.includes(q) || card.back.toLowerCase().includes(q) || card.ex.toLowerCase().includes(q) || card.exKo.includes(q)) {
        rest.push({ deck, card });
      }
      if (first.length >= MAX_HITS) return first;
    }
  }
  return first.concat(rest).slice(0, MAX_HITS);
}

import type { CardDeckId } from './data/decks';
import type { Progress } from './progress';

// 헷갈린 카드: 마지막 채점이 '다시 볼래요'(또는 오답)라 복습 상자가 0번인 카드. 오래 헷갈린 순
export const weakIds = (p: Progress, deck: CardDeckId): string[] => {
  const prefix = `${deck}:`;
  return Object.entries(p.cards)
    .filter(([k, c]) => k.startsWith(prefix) && c.box === 0)
    .sort((a, b) => a[1].due.localeCompare(b[1].due))
    .map(([k]) => k.slice(prefix.length));
};

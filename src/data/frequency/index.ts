import type { Card } from '../decks';
import part1 from './part1';
import part2 from './part2';
import part3 from './part3';
import part4 from './part4';
import type { FrequencyRow } from './types';

// 영화·드라마 자막(OpenSubtitles) 빈도순으로 고른 일상 회화 단어.
// 발음기호는 CMU 발음 사전에서 변환했다.
const toCard = ([front, tag, hint, back, ex, exKo]: FrequencyRow): Card => ({ id: front, tag, front, hint, back, ex, exKo });

export const frequencyParts = [part1, part2, part3, part4].map((rows) => rows.map(toCard));

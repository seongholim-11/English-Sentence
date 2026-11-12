import { Platform, Share } from 'react-native';

import { applySetSize, getSetSize } from './data/decks';
import { Progress, dateKey, sanitize } from './progress';

// 학습 기록을 텍스트(JSON)로 내보내고 다시 가져온다. 서버를 거치지 않고, 내보낸 내용은 이용자가 직접 보관한다.
export const BACKUP_APP = 'lingoloop';
export const BACKUP_VERSION = 1;
const MAX_BACKUP_CHARS = 5_000_000;

export const backupFileName = (d: Date = new Date()) => `lingoloop-backup-${dateKey(d)}.json`;

export const makeBackup = (p: Progress): string =>
  JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data: p });

export type ParsedBackup =
  | { ok: true; progress: Progress; exportedAt: string | null }
  | { ok: false; reason: string };

const isRecord = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

// 백업 내용을 검사한다. 깨진 값은 불러올 때처럼 걸러 내고, 링고루프 백업이 아니면 거절한다.
export function parseBackup(text: string): ParsedBackup {
  const t = text.trim();
  if (!t) return { ok: false, reason: '백업 내용을 붙여 넣거나 파일을 골라 주세요.' };
  if (t.length > MAX_BACKUP_CHARS) return { ok: false, reason: '내용이 너무 길어서 읽을 수 없어요.' };
  let raw: unknown;
  try {
    raw = JSON.parse(t);
  } catch {
    return { ok: false, reason: '백업 내용을 읽지 못했어요. 내보낸 내용을 처음부터 끝까지 그대로 붙여 넣었는지 확인해 주세요.' };
  }
  if (!isRecord(raw) || raw.app !== BACKUP_APP || !isRecord(raw.data)) {
    return { ok: false, reason: '링고루프에서 내보낸 백업이 아니에요.' };
  }
  if (typeof raw.version === 'number' && raw.version > BACKUP_VERSION) {
    return { ok: false, reason: '더 새로운 버전의 앱에서 만든 백업이에요. 앱을 업데이트한 뒤 다시 시도해 주세요.' };
  }
  // sanitize는 세트 크기를 전역으로 바꾸므로, 미리보기만 하는 동안은 원래 값으로 되돌려 둔다
  const prev = getSetSize();
  let progress: Progress;
  try {
    progress = sanitize(raw.data);
  } finally {
    applySetSize(prev);
  }
  return { ok: true, progress, exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : null };
}

// 웹 전용 도우미: document는 웹에서만 있다
const webDocument = (): any => (globalThis as any).document;

// 내보내기. 웹은 파일로 내려받고, 앱은 공유 시트를 연다 (복사·파일에 저장·메시지 등을 고를 수 있다)
export async function exportBackup(p: Progress): Promise<'downloaded' | 'shared' | 'dismissed'> {
  const json = makeBackup(p);
  if (Platform.OS === 'web') {
    const doc = webDocument();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = doc.createElement('a');
    a.href = url;
    a.download = backupFileName();
    doc.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  }
  const r = await Share.share({ message: json, title: '링고루프 백업' });
  return r.action === Share.dismissedAction ? 'dismissed' : 'shared';
}

// 웹에서 백업 파일을 골라 내용을 읽는다. 고르지 않으면 null
export function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const doc = webDocument();
    if (!doc) return resolve(null);
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json,text/plain';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return resolve(null);
      file.text().then(resolve, reject);
    };
    input.click();
  });
}

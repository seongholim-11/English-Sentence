// 카드 문구를 Google Cloud Text-to-Speech(Chirp 3 HD)로 미리 음성 파일(mp3)로 만든다.
// 앱이 실행 중에 서버를 부르지 않도록, 개발자 PC에서 한 번만 돌리는 스크립트다.
//
// 사용법 (프로젝트 루트에서):
//   npm run audio -- --dry-run                 읽을 문구 수·글자 수만 센다 (인증·비용 없음)
//   npm run audio -- --list-voices             쓸 수 있는 Chirp 3 HD 영어 음성 목록
//   npm run audio -- --sample=10               대표 문구 10개만 만들어 들어 본다 (assets/audio-samples)
//   npm run audio                              전체 생성 (이미 있는 파일은 건너뜀)
//   npm run audio -- --scope=examples          단어·구동사 예문까지 포함
//
// 설정은 .env 에서 읽는다 (.env.example 참고). 키 파일은 쓰지 않고 gcloud ADC 토큰을 쓴다.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}` || a.startsWith(`--${name}=`));
const val = (name, dflt) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : dflt;
};

const CHAR_LIMIT = Number(process.env.TTS_CHAR_LIMIT || 200000);
const VOICE = process.env.TTS_VOICE || 'en-US-Chirp3-HD-Aoede';
const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || '';
const GCLOUD = process.env.GCLOUD_PATH || 'gcloud';
const FREE_TIER = 1_000_000; // 월 무료 한도(글자). 가격 페이지에서 직접 확인할 것
const PRICE_PER_MILLION = 30; // Chirp 3 HD, USD. 가격 페이지에서 직접 확인할 것

const OUT_DIR = path.join(ROOT, 'assets', 'audio');
const SAMPLE_DIR = path.join(ROOT, 'assets', 'audio-samples');
const INDEX_FILE = path.join(OUT_DIR, 'index.json');
const MANIFEST_FILE = path.join(ROOT, 'src', 'audio', 'manifest.ts');

// ---- 카드 데이터 읽기 (TypeScript 소스를 그대로 불러온다) ----
function loadData() {
  const ts = require(path.join(ROOT, 'node_modules', 'typescript'));
  const Module = require('module');
  const orig = Module._load;
  Module._load = function (req) {
    // react-native 같은 외부 모듈은 데이터 읽기에 필요 없어서 빈 객체로 대신한다
    if (!req.startsWith('.') && !path.isAbsolute(req) && !req.startsWith('node:') && !['fs', 'path', 'module'].includes(req)) {
      return new Proxy({}, { get: () => () => ({}) });
    }
    return orig.apply(this, arguments);
  };
  require.extensions['.ts'] = (m, f) =>
    m._compile(
      ts.transpileModule(fs.readFileSync(f, 'utf8'), { compilerOptions: { module: 'commonjs', target: 'es2020', esModuleInterop: true } }).outputText,
      f,
    );
  const { cardDecks } = require(path.join(ROOT, 'src/data/decks.ts'));
  const { dialogues } = require(path.join(ROOT, 'src/data/dialogues.ts'));
  return { cardDecks, dialogues };
}

// 앱이 실제로 읽어 주는 문구. src/data/decks.ts 의 speakText 와 같은 규칙이다
function collectTexts(scope) {
  const { cardDecks, dialogues } = loadData();
  const groups = [];
  for (const [deck, cards] of Object.entries(cardDecks)) {
    groups.push({ kind: deck, texts: cards.map((c) => (deck === 'sentences' ? c.back : c.front)) });
    if (scope === 'examples' && deck !== 'sentences') groups.push({ kind: `${deck}-example`, texts: cards.map((c) => c.ex) });
  }
  groups.push({ kind: 'dialogue', texts: dialogues.flatMap((d) => d.lines.map((l) => l.en)) });
  groups.push({ kind: 'settings', texts: ['How are you doing today?'] });
  const seen = new Map();
  for (const g of groups) for (const t of g.texts) if (t && !seen.has(t)) seen.set(t, g.kind);
  return [...seen.entries()].map(([text, kind]) => ({ text, kind }));
}

const fileFor = (text) => crypto.createHash('sha1').update(text).digest('hex').slice(0, 12) + '.mp3';
const chars = (list) => list.reduce((n, x) => n + [...x.text].length, 0);

// ---- 인증: gcloud ADC 토큰 ----
let token = { value: '', at: 0 };
function accessToken() {
  if (!token.value || Date.now() - token.at > 30 * 60 * 1000) {
    token = { value: execSync(`"${GCLOUD}" auth application-default print-access-token`, { encoding: 'utf8' }).trim(), at: Date.now() };
  }
  return token.value;
}
function headers() {
  if (!PROJECT) throw new Error('.env 에 GOOGLE_CLOUD_PROJECT 를 설정하세요 (결제가 연결되고 Text-to-Speech API가 켜진 프로젝트).');
  return { Authorization: `Bearer ${accessToken()}`, 'x-goog-user-project': PROJECT, 'Content-Type': 'application/json' };
}

async function listVoices() {
  const res = await fetch('https://texttospeech.googleapis.com/v1/voices?languageCode=en-US', { headers: headers() });
  const j = await res.json();
  if (j.error) throw new Error(`${j.error.code} ${j.error.message}`);
  const names = (j.voices || []).filter((v) => v.name.includes('Chirp3-HD')).map((v) => `${v.name}  (${v.ssmlGender})`);
  console.log(names.join('\n') || 'Chirp 3 HD 영어 음성을 찾지 못했습니다.');
}

async function synthesize(text, attempt = 0) {
  const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-US', name: VOICE },
      audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000 },
    }),
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    return synthesize(text, attempt + 1);
  }
  const j = await res.json();
  if (j.error) throw new Error(`${j.error.code} ${j.error.status || ''} ${j.error.message}`);
  return Buffer.from(j.audioContent, 'base64');
}

async function pool(items, size, worker) {
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const mine = items[i++];
        await worker(mine);
      }
    }),
  );
}

// 만들어 둔 파일 목록으로 앱이 읽는 manifest 를 다시 쓴다
function writeManifest(index) {
  const entries = Object.entries(index.files)
    .filter(([, f]) => fs.existsSync(path.join(OUT_DIR, f)))
    .sort(([a], [b]) => a.localeCompare(b));
  const body = entries.map(([text, f]) => `  ${JSON.stringify(text)}: require('../../assets/audio/${f}'),`).join('\n');
  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
  fs.writeFileSync(
    MANIFEST_FILE,
    `// 자동 생성: npm run audio. 직접 고치지 마세요.\n// 문구 → 미리 만든 음성 파일. 여기에 없는 문구는 기기 내장 음성으로 읽는다.\nexport const audioFiles: Record<string, number> = {\n${body}\n};\n`,
  );
  return entries.length;
}

function readIndex() {
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  } catch {
    return { voice: VOICE, files: {} };
  }
}

async function main() {
  const scope = val('scope', 'speakable');
  const all = collectTexts(scope);
  const index = readIndex();
  const todo = all.filter((x) => !(index.files[x.text] && fs.existsSync(path.join(OUT_DIR, index.files[x.text]))));
  const total = chars(all);
  const need = chars(todo);

  const usd = (n) => `$${((Math.max(0, n) / 1_000_000) * PRICE_PER_MILLION).toFixed(2)}`;
  console.log(`범위: ${scope}`);
  console.log(`읽을 문구: ${all.length}개 / ${total.toLocaleString()}자`);
  console.log(`이미 만든 것: ${all.length - todo.length}개, 새로 만들 것: ${todo.length}개 / ${need.toLocaleString()}자`);
  console.log(`무료 한도(${FREE_TIER.toLocaleString()}자) 대비: ${((need / FREE_TIER) * 100).toFixed(1)}%  (한도 안이면 약 $0, 넘으면 약 ${usd(need - FREE_TIER)})`);
  console.log(`음성: ${VOICE}`);

  if (flag('dry-run')) return;
  if (flag('list-voices')) return listVoices();

  if (index.voice && index.voice !== VOICE && Object.keys(index.files).length) {
    throw new Error(`이미 만든 파일의 음성(${index.voice})과 설정(${VOICE})이 다릅니다. 섞이지 않게 assets/audio 를 지우고 다시 만드세요.`);
  }

  const sampleN = Number(val('sample', 0));
  if (sampleN) {
    // 종류별로 골고루 뽑아 듣기 좋은 샘플을 만든다
    const kinds = [...new Set(all.map((x) => x.kind))];
    const picks = [];
    for (let k = 0; picks.length < sampleN; k++) {
      let added = false;
      for (const kind of kinds) {
        const pool_ = all.filter((x) => x.kind === kind);
        const item = pool_[(k * 37) % pool_.length];
        if (item && !picks.includes(item) && picks.length < sampleN) { picks.push(item); added = true; }
      }
      if (!added) break;
    }
    fs.mkdirSync(SAMPLE_DIR, { recursive: true });
    console.log(`샘플 ${picks.length}개 (${chars(picks)}자) 생성 → ${SAMPLE_DIR}`);
    for (const p of picks) {
      const buf = await synthesize(p.text);
      const name = `${p.kind}-${fileFor(p.text)}`;
      fs.writeFileSync(path.join(SAMPLE_DIR, name), buf);
      console.log(`  ${name}  ${JSON.stringify(p.text)}`);
    }
    return;
  }

  if (need > CHAR_LIMIT) {
    throw new Error(`이번에 만들 ${need.toLocaleString()}자가 TTS_CHAR_LIMIT(${CHAR_LIMIT.toLocaleString()}자)를 넘습니다. .env 의 상한을 올리거나 범위를 줄이세요.`);
  }
  if (!todo.length) {
    console.log('새로 만들 문구가 없습니다.');
    console.log(`manifest 갱신: ${writeManifest(index)}개`);
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  index.voice = VOICE;
  let done = 0;
  let failed = 0;
  await pool(todo, 3, async (item) => {
    try {
      const buf = await synthesize(item.text);
      const f = fileFor(item.text);
      fs.writeFileSync(path.join(OUT_DIR, f), buf);
      index.files[item.text] = f;
    } catch (e) {
      failed++;
      console.error(`실패: ${JSON.stringify(item.text)} → ${e.message}`);
    }
    done++;
    if (done % 100 === 0 || done === todo.length) {
      fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 1)); // 중간에 멈춰도 이어서 할 수 있게 자주 저장
      console.log(`  ${done}/${todo.length}`);
    }
  });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 1));
  console.log(`완료. 실패 ${failed}개. manifest 갱신: ${writeManifest(index)}개`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

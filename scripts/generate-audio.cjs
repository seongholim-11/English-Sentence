// 카드 문구를 Google Cloud Text-to-Speech(Chirp 3 HD)로 미리 음성 파일(mp3)로 만든다.
// 앱이 실행 중에 서버를 부르지 않도록, 개발자 PC에서 한 번만 돌리는 스크립트다.
//
// 단어·구동사·문장·예문·대화문을 모두 만든다.
// 목소리는 두 가지다. main(기본)은 단어·구동사·문장·예문을 읽고,
// 대화문에서는 A(상대방)는 main, B(나)는 alt로 번갈아 읽는다.
//
// 사용법 (프로젝트 루트에서):
//   npm run audio -- --dry-run                 읽을 문구 수·글자 수만 센다 (인증·비용 없음)
//   npm run audio -- --list-voices             쓸 수 있는 Chirp 3 HD 영어 음성 목록
//   npm run audio -- --sample=6 --voice=NAME   대표 문구 6개만 만들어 들어 본다 (assets/audio-samples/<음성>/)
//   npm run audio                              전체 생성 (이미 있는 파일은 건너뜀, 이어서 가능)
//   npm run audio -- --scope=speakable         단어·구동사 예문은 빼고 만든다 (기본은 예문 포함)
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
const VOICES = {
  main: val('voice', process.env.TTS_VOICE || 'en-US-Chirp3-HD-Aoede'),
  alt: process.env.TTS_VOICE_ALT || 'en-US-Chirp3-HD-Charon',
};
const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || '';
const GCLOUD = process.env.GCLOUD_PATH || 'gcloud';
const FREE_TIER = 1_000_000; // 월 무료 한도(글자). 가격 페이지에서 직접 확인할 것
const PRICE_PER_MILLION = 30; // Chirp 3 HD, USD. 가격 페이지에서 직접 확인할 것
const MIN_GAP_MS = 1300; // 요청 하나당 최소 간격. 동시 3개 기준 분당 약 140건으로 제한해 한도(429)를 피한다

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
  const { explainExpression } = require(path.join(ROOT, 'src/data/expressions.ts'));
  return { cardDecks, dialogues, explainExpression };
}

// 앱이 실제로 읽어 주는 문구. src/data/decks.ts 의 speakText, DialogueScreen 의 규칙과 같다
function collectItems(scope) {
  const { cardDecks, dialogues, explainExpression } = loadData();
  const items = [];
  for (const [deck, cards] of Object.entries(cardDecks)) {
    for (const c of cards) items.push({ text: deck === 'sentences' ? c.back : c.front, kind: deck, voice: 'main' });
    if (scope !== 'speakable' && deck !== 'sentences') for (const c of cards) items.push({ text: c.ex, kind: `${deck}-example`, voice: 'main' });
  }
  for (const d of dialogues) for (const l of d.lines) items.push({ text: l.en, kind: 'dialogue', voice: l.who === 'A' ? 'main' : 'alt' });
  // 대화문 표현 설명: 표현과 예문 (덱에 있는 표현은 위에서 이미 들어 있다)
  for (const d of dialogues) {
    for (const e of d.expressions) {
      const info = explainExpression(e);
      if (!info) {
        console.warn(`설명이 없는 대화문 표현: ${d.id} / ${e}`);
        continue;
      }
      items.push({ text: info.term, kind: 'expression', voice: 'main' });
      items.push({ text: info.ex, kind: 'expression-example', voice: 'main' });
    }
  }
  items.push({ text: 'How are you doing today?', kind: 'settings', voice: 'main' });
  const seen = new Set();
  const out = [];
  for (const it of items) {
    const key = keyOf(it.voice, it.text);
    if (it.text && !seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

const keyOf = (voice, text) => `${voice}|${text}`;
const fileFor = (voice, text) => crypto.createHash('sha1').update(keyOf(voice, text)).digest('hex').slice(0, 12) + '.mp3';
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

async function synthesize(text, voiceName, attempt = 0) {
  const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: 'en-US', name: voiceName },
      audioConfig: { audioEncoding: 'MP3', sampleRateHertz: 24000 },
    }),
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 6) {
    await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
    return synthesize(text, voiceName, attempt + 1);
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
        const t0 = Date.now();
        await worker(mine);
        const wait = MIN_GAP_MS - (Date.now() - t0);
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      }
    }),
  );
}

// 만들어 둔 파일 목록으로 앱이 읽는 manifest 를 다시 쓴다
function writeManifest(index) {
  const byVoice = { main: [], alt: [] };
  for (const [key, f] of Object.entries(index.files)) {
    if (!fs.existsSync(path.join(OUT_DIR, f))) continue;
    const sep = key.indexOf('|');
    byVoice[key.slice(0, sep)].push([key.slice(sep + 1), f]);
  }
  let n = 0;
  const blocks = Object.entries(byVoice).map(([voice, entries]) => {
    entries.sort(([a], [b]) => a.localeCompare(b));
    n += entries.length;
    const body = entries.map(([text, f]) => `    ${JSON.stringify(text)}: require('../../assets/audio/${f}'),`).join('\n');
    return `  ${voice}: {\n${body}\n  },`;
  });
  fs.mkdirSync(path.dirname(MANIFEST_FILE), { recursive: true });
  fs.writeFileSync(
    MANIFEST_FILE,
    `// 자동 생성: npm run audio. 직접 고치지 마세요.\n// 목소리(main/alt) → 문구 → 미리 만든 음성 파일. 여기에 없는 문구는 기기 내장 음성으로 읽는다.\nexport type VoiceSlot = 'main' | 'alt';\n\nexport const audioFiles: Record<VoiceSlot, Record<string, number>> = {\n${blocks.join('\n')}\n};\n`,
  );
  return n;
}

function readIndex() {
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  } catch {
    return { voices: { ...VOICES }, files: {} };
  }
}

async function main() {
  const scope = val('scope', 'all');
  const all = collectItems(scope);
  const index = readIndex();
  const have = (x) => index.files[keyOf(x.voice, x.text)] && fs.existsSync(path.join(OUT_DIR, index.files[keyOf(x.voice, x.text)]));
  const todo = all.filter((x) => !have(x));
  const total = chars(all);
  const need = chars(todo);

  const usd = (n) => `$${((Math.max(0, n) / 1_000_000) * PRICE_PER_MILLION).toFixed(2)}`;
  console.log(`범위: ${scope}`);
  console.log(`읽을 문구: ${all.length}개 / ${total.toLocaleString()}자  (main ${all.filter((x) => x.voice === 'main').length}, alt ${all.filter((x) => x.voice === 'alt').length})`);
  console.log(`이미 만든 것: ${all.length - todo.length}개, 새로 만들 것: ${todo.length}개 / ${need.toLocaleString()}자`);
  console.log(`무료 한도(${FREE_TIER.toLocaleString()}자) 대비: ${((need / FREE_TIER) * 100).toFixed(1)}%  (한도 안이면 약 $0, 넘으면 약 ${usd(need - FREE_TIER)})`);
  console.log(`음성: main=${VOICES.main}, alt=${VOICES.alt}`);

  if (flag('dry-run')) return;
  if (flag('list-voices')) return listVoices();

  const sampleN = Number(val('sample', 0));
  if (sampleN) {
    // 종류별로 골고루 뽑아 듣기 좋은 샘플을 만든다 (대화문은 main 목소리로)
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
    const dir = path.join(SAMPLE_DIR, VOICES.main.replace('en-US-Chirp3-HD-', ''));
    fs.mkdirSync(dir, { recursive: true });
    console.log(`샘플 ${picks.length}개 (${chars(picks)}자), 음성 ${VOICES.main} → ${dir}`);
    for (const p of picks) {
      const buf = await synthesize(p.text, VOICES.main);
      const name = `${picks.indexOf(p) + 1}-${p.kind}.mp3`;
      fs.writeFileSync(path.join(dir, name), buf);
      console.log(`  ${name}  ${(buf.length / 1024).toFixed(1)}KB  ${JSON.stringify(p.text)}`);
    }
    return;
  }

  // 이미 만든 파일과 설정이 다른 목소리로 섞이면 안 된다
  const prev = index.voices || {};
  if (Object.keys(index.files).length && (prev.main !== VOICES.main || prev.alt !== VOICES.alt)) {
    throw new Error(`이미 만든 파일의 음성(${JSON.stringify(prev)})과 설정(${JSON.stringify(VOICES)})이 다릅니다. 섞이지 않게 assets/audio 를 지우고 다시 만드세요.`);
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
  index.voices = { ...VOICES };
  let done = 0;
  let failed = 0;
  const t0 = Date.now();
  await pool(todo, 3, async (item) => {
    try {
      const buf = await synthesize(item.text, VOICES[item.voice]);
      const f = fileFor(item.voice, item.text);
      fs.writeFileSync(path.join(OUT_DIR, f), buf);
      index.files[keyOf(item.voice, item.text)] = f;
    } catch (e) {
      failed++;
      console.error(`실패: [${item.voice}] ${JSON.stringify(item.text)} → ${e.message}`);
    }
    done++;
    if (done % 100 === 0 || done === todo.length) {
      fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 1)); // 중간에 멈춰도 이어서 할 수 있게 자주 저장
      const sec = (Date.now() - t0) / 1000;
      console.log(`  ${done}/${todo.length}  (경과 ${Math.round(sec / 60)}분, 남은 시간 약 ${Math.round(((todo.length - done) * sec) / done / 60)}분)`);
    }
  });
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 1));
  console.log(`완료. 실패 ${failed}개. manifest 갱신: ${writeManifest(index)}개`);
  if (failed) console.log('실패한 것은 같은 명령을 다시 실행하면 이어서 만듭니다.');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

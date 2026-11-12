import fs from 'node:fs/promises';
import path from 'node:path';
const root = 'D:/personal_project/English-Sentence';
const out = `${root}/docs/store-previews`;
const data = async (p, mime) => `data:${mime};base64,${(await fs.readFile(`${root}/${p}`)).toString('base64')}`;
const bold = await data('node_modules/@expo-google-fonts/ibm-plex-sans-kr/700Bold/IBMPlexSansKR_700Bold.ttf','font/ttf');
const semi = await data('node_modules/@expo-google-fonts/ibm-plex-sans-kr/600SemiBold/IBMPlexSansKR_600SemiBold.ttf','font/ttf');
const regular = await data('node_modules/@expo-google-fonts/ibm-plex-sans-kr/400Regular/IBMPlexSansKR_400Regular.ttf','font/ttf');
const space = await data('node_modules/@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf','font/ttf');
const icon = await data('assets/icon.png','image/png');
const screens = {};
for (const n of ['01-home','02-decks','03-study','04-quiz','05-dialogue','06-stats']) screens[n] = await data(`docs/screenshots/iphone-6.9/${n}.png`,'image/png');
const phone = (screen,cls='') => `<div class="phone ${cls}"><div class="display"><div class="status"><span>9:41</span><i></i><svg viewBox="0 0 110 32"><path d="M3 27V22M13 27V16M23 27V9M33 27V3" stroke="currentColor" stroke-width="7"/><path d="M48 11q15-14 30 0M54 18q9-9 18 0" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="63" cy="25" r="3"/><rect x="86" y="5" width="19" height="23" rx="5" fill="none" stroke="currentColor" stroke-width="3"/><rect x="90" y="9" width="11" height="15" rx="2"/></svg></div><img class="app-screen" src="${screens[screen]}" alt="${screen}"></div><b class="side"></b></div>`;
const header = (a,b,sub,cls='') => `<header class="${cls}"><h1><span>${a}</span><strong>${b}</strong></h1><p>${sub}</p></header>`;
const loop = `<svg class="loop" viewBox="0 0 2640 2868" fill="none"><path d="M2200 2050C2420 1480 2040 930 1450 1080C920 1215 670 1920 1160 2320C1450 2560 1850 2460 2060 2230" stroke="white" stroke-width="140"/><path d="M1955 2200L2082 2425L2220 2140Z" fill="white"/><path d="M270 1810C-50 1380 210 940 650 985" stroke="white" stroke-width="80"/><path d="M580 850L765 1005L535 1090Z" fill="white"/></svg>`;
const css = `
@font-face{font-family:Plex;src:url('${bold}');font-weight:700}@font-face{font-family:Plex;src:url('${semi}');font-weight:600}@font-face{font-family:Plex;src:url('${regular}');font-weight:400}@font-face{font-family:Space;src:url('${space}');font-weight:700}
*{box-sizing:border-box}html,body{margin:0;padding:0;width:1320px;height:2868px;overflow:hidden}body{font-family:Plex,sans-serif;color:#0F1240;-webkit-font-smoothing:antialiased}.stage{position:relative;width:1320px;height:2868px;overflow:hidden;background:#F3F3F3}.blue{color:#fff;background:radial-gradient(ellipse at 23% 24%,#6385ff55,transparent 52%),linear-gradient(155deg,#2F5BFF 0%,#254be6 47%,#1233C0 100%)}
header{position:absolute;top:150px;left:75px;width:1170px;text-align:center;z-index:5}h1{margin:0;font-size:124px;line-height:1.34;font-weight:700;letter-spacing:-6px}h1 span,h1 strong{display:block;white-space:nowrap}h1 strong{font-weight:700;color:#2F5BFF}header p{margin:48px 0 0;font-size:43px;line-height:1.5;font-weight:400;letter-spacing:-1.5px;color:#60667c}.blue h1 strong{color:#c2e8ff}.blue header p{color:#e0e8ff}
.phone{position:absolute;z-index:3;left:190px;top:855px;width:940px;padding:19px;border:4px solid #8b8d96;border-radius:128px;background:#101114;box-shadow:0 50px 90px #10144432,inset 0 0 0 3px #37383c}.display{overflow:hidden;border-radius:105px;background:#f3f3ef}.status{height:100px;position:relative;display:flex;align-items:center;justify-content:space-between;padding:0 57px;font:700 31px Space;color:#111218}.status i{position:absolute;width:257px;height:64px;top:17px;left:50%;transform:translateX(-50%);border-radius:40px;background:#08090b}.status svg{width:102px;height:31px}.app-screen{display:block;width:100%;height:auto;aspect-ratio:1320/2868;object-fit:cover}.side{position:absolute;left:-10px;top:295px;width:7px;height:110px;background:#64656c;border-radius:5px;box-shadow:0 145px #64656c}.stage:after{content:'';position:absolute;width:1100px;height:1100px;left:110px;top:1150px;border-radius:50%;border:2px solid #2f5bff0c;z-index:0}.blue:after{border:2px solid #ffffff0c}.halo{position:absolute;top:1240px;left:-340px;width:2000px;height:1500px;background:radial-gradient(ellipse,#2f5bff16,transparent 65%)}
.pair{width:2640px}.pair header{width:1170px}.pair .right-head{left:1395px}.pair .intro-icon{position:absolute;top:880px;left:210px;width:480px;height:480px;border-radius:112px;box-shadow:0 45px 90px #06165c40;border:2px solid #ffffff2e;z-index:4}.pair .loop{position:absolute;inset:0;width:2640px;height:2868px;opacity:.085}.pair .phone{left:1010px;top:1010px;width:970px;transform:rotate(12deg);box-shadow:0 55px 110px #05124c60}.pair .chips{position:absolute;top:1055px;left:2100px;width:410px;display:grid;gap:28px;z-index:5}.chip{border:2px solid #ffffff36;background:#ffffff12;border-radius:42px;padding:30px 34px;backdrop-filter:blur(8px);font-size:38px;color:#e0e8ff;line-height:1.4}.chip b{display:block;font:700 67px Space;color:#fff;margin-top:6px}.chip small{font:600 31px Plex}.pair header p{font-size:39px}.pair header h1{font-size:119px}.pair .right-head p{max-width:1090px;margin-left:auto;margin-right:auto}.pair:after{display:none}.s4 h1{font-size:116px}.s5 h1{font-size:116px}.s8 h1{font-size:111px}.s8 header p{font-size:41px}.s4 .phone,.s7 .phone{top:785px;width:920px;left:200px}.s7 header p{margin-top:42px}.s7 .phone{top:790px}.s6 .phone{top:795px;width:940px}.s8 .phone{top:840px}.s3 .phone{top:830px}.s5 .phone{top:830px}
`;
const finalCss = `.s4 .phone,.s7 .phone{top:855px}
.pair .phone{top:830px}
.pair .chips{left:2200px;top:1080px;width:330px}
.pair .chip{backdrop-filter:none;background:rgba(255,255,255,.10)}
.s7 .display{position:relative}
.s7 .display:after{content:'';position:absolute;z-index:2;left:0;right:0;top:calc(100px + (100% - 100px)*.068);height:calc((100% - 100px)*.031);background:#f3f3ef;pointer-events:none}`;
const slides = {
pair:`<main class="stage blue pair">${loop}${header('한 번 보고 끝내지 말고','다시 돌려 보세요','영어 회독 앱 링고루프')}${header('돌려 볼수록','익숙해져요','영단어 · 구동사 · 문장 · 대화문을 카드로 한 바퀴씩','right-head')}<img class="intro-icon" src="${icon}" alt="링고루프">${phone('03-study')}<div class="chips"><div class="chip">영단어<b>2,072</b></div><div class="chip">구동사<b>100</b></div><div class="chip">문장<b>500</b></div><div class="chip">대화문<b>50<small>편</small></b></div></div></main>`,
3:`<main class="stage s3"><div class="halo"></div>${header('잊을 때쯤','다시 나와요','1·3·7·14·30일 간격 복습')}${phone('01-home')}</main>`,
4:`<main class="stage s4"><div class="halo"></div>${header('탭해서 확인하고','알아요·다시 볼래요','예문과 발음까지 한 번에')}${phone('03-study')}</main>`,
5:`<main class="stage s5"><div class="halo"></div>${header('단어부터 대화문까지','한 곳에서','세트로 나눠 부담 없이 시작')}${phone('02-decks')}</main>`,
6:`<main class="stage blue s6">${header('세트마다','퀴즈로 확인','뜻 고르기 · 빈칸 채우기')}${phone('04-quiz')}</main>`,
7:`<main class="stage s7"><div class="halo"></div>${header('대화를 가리고','말해 보세요','전체 듣기 · 표현 설명')}${phone('05-dialogue')}</main>`,
8:`<main class="stage blue s8">${header('가입도 광고도 없이','내 기록은 내 기기에','인터넷 없이도 들을 수 있는 영어 발음')}${phone('06-stats')}</main>`
};
await fs.mkdir(`${out}/iphone-6.9`,{recursive:true});
await fs.writeFile(`${out}/src/previews.html`,`<!doctype html><html lang="ko"><meta charset="utf-8"><title>링고루프 앱스토어 미리보기</title><style>${css}${finalCss}</style><body><script>const slides=${JSON.stringify(slides)};const id=new URLSearchParams(location.search).get('slide')||'pair';document.body.innerHTML=slides[id];if(id==='pair'&&new URLSearchParams(location.search).get('half')==='2')document.querySelector('main').style.left='-1320px';</script></body></html>`);
console.log('Built self-contained previews.html');

import fs from 'node:fs/promises';
const root='D:/personal_project/English-Sentence/docs/store-previews';
let source=await fs.readFile(`${root}/src/build.mjs`,'utf8');
source=source.replace('docs/screenshots/iphone-6.9/','docs/screenshots/ipad-13/');
const start=source.indexOf('const phone = '),end=source.indexOf('const header = ',start);
source=source.slice(0,start)+`const phone = (screen,cls='') => \`<div class="phone tablet \${cls}"><div class="display"><img class="app-screen" src="\${screens[screen]}" alt="\${screen}"></div><i class="camera"></i></div>\`;\n`+source.slice(end);
const ipadCss=`
html,body,.stage{width:2064px;height:2752px}
header{top:234.545px;left:117.273px;width:1829.455px}
h1{font-size:193.891px;letter-spacing:-9.382px}
header p{margin-top:75.055px;font-size:67.236px;letter-spacing:-2.345px}
.s4 h1,.s5 h1{font-size:181.382px}.s8 h1{font-size:173.564px}.s8 header p{font-size:64.109px}
.s7 header p{margin-top:65.673px}
.phone,.s3 .phone,.s4 .phone,.s5 .phone,.s6 .phone,.s7 .phone,.s8 .phone{left:352px;top:925px;width:1360px;padding:28px;border:4px solid #777a84;border-radius:78px;background:#101114;box-shadow:0 50px 90px #10144432,inset 0 0 0 3px #37383c}
.display{position:relative;border-radius:46px;background:#f3f3ef;overflow:hidden}
.app-screen{width:100%;height:auto;aspect-ratio:2064/2752;object-fit:cover}
.camera{position:absolute;top:10px;left:calc(50% - 5px);width:10px;height:10px;border-radius:50%;background:#252b39;box-shadow:inset 0 0 0 2px #08090b}
.s7 .display:after{display:none}
.stage:after{width:1720px;height:1720px;left:172px;top:1130px}
.halo{top:1100px;left:-300px;width:2664px;height:1650px}
.pair{width:4128px}.pair header{width:1829.455px}.pair .right-head{left:2181.273px}
.pair header h1{font-size:186.073px}.pair header p{font-size:60.982px}.pair .right-head p{max-width:1704.364px}
.pair .intro-icon{top:1170px;left:328px;width:660px;height:660px;border-radius:154px;box-shadow:0 45px 90px #06165c40}
.pair .loop{width:4128px;height:2752px}
.pair .phone{left:1460px;top:1000px;width:1600px;transform:rotate(12deg);box-shadow:0 55px 110px #05124c60}
.pair .chips{left:3500px;top:1110px;width:500px;gap:36px}
.pair .chip{padding:36px 44px;border-radius:56px;font-size:59.418px;line-height:1.4;backdrop-filter:none;background:rgba(255,255,255,.10)}
.chip b{font-size:104.764px;margin-top:9px}.chip small{font-size:48.473px}
`;
source=source.replace('${css}${finalCss}', '${css}${finalCss}'+ipadCss);
source=source.replace('`${out}/iphone-6.9`','`${out}/ipad-13`').replace('`${out}/src/previews.html`','`${out}/src/previews-ipad.html`');
source=source.replace("'-1320px'","'-2064px'");
await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
console.log('Built previews-ipad.html, preserving iPhone sources');

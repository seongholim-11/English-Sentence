const fs=await import('node:fs/promises'),crypto=await import('node:crypto');
const root='D:/personal_project/English-Sentence/docs/store-previews';
const {spaceId}=JSON.parse(await fs.readFile(`${root}/src/ipad-space.json`,'utf8'));
const task=await taskSpace(spaceId),page=task.page('p1');
const names=['01-loop','02-cards','03-review','04-study','05-decks','06-quiz','07-dialogue','08-stats'];
const images=await Promise.all(names.map(async n=>'data:image/png;base64,'+(await fs.readFile(`${root}/ipad-13/${n}.png`)).toString('base64')));
await page.cdp('Emulation.setDeviceMetricsOverride',{width:4128,height:2752,deviceScaleFactor:1,mobile:false});
await page.goto(`file:///${root}/src/previews-ipad.html?slide=pair`);
await page.evaluate(async()=>{document.documentElement.style.width='4128px';document.body.style.width='4128px';await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
const wide=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:4128,height:2752,scale:1}});
const result=await page.evaluate(async({images,wide})=>{
 const load=async src=>{const im=new Image();im.src=src;await im.decode();return im;};
 const ims=await Promise.all(images.map(load));
 const pair=document.createElement('canvas');pair.width=4128;pair.height=2752;const ctx=pair.getContext('2d');ctx.drawImage(ims[0],0,0);ctx.drawImage(ims[1],2064,0);
 const full=document.createElement('canvas');full.width=4128;full.height=2752;const fctx=full.getContext('2d');fctx.drawImage(await load('data:image/png;base64,'+wide),0,0);
 const a=ctx.getImageData(2056,0,16,2752).data,b=fctx.getImageData(2056,0,16,2752).data;let mismatch=0,maxDiff=0;for(let i=0;i<a.length;i++){if(a[i]!==b[i])mismatch++;maxDiff=Math.max(maxDiff,Math.abs(a[i]-b[i]));}
 const sheet=document.createElement('canvas');sheet.width=1652;sheet.height=1102;const sctx=sheet.getContext('2d');ims.forEach((im,i)=>sctx.drawImage(im,(i%4)*413,Math.floor(i/4)*551,413,551));
 const tablet=document.querySelector('.phone').getBoundingClientRect(),chips=document.querySelector('.chips').getBoundingClientRect();
 return {dimensions:ims.map(im=>[im.width,im.height]),seam:{mismatchedChannels:mismatch,maxChannelDifference:maxDiff},chipTabletGap:chips.left-tablet.right,pair:pair.toDataURL().split(',')[1],sheet:sheet.toDataURL().split(',')[1]};
},{images,wide:wide.data});
await fs.writeFile(`${root}/pair-check-ipad.png`,Buffer.from(result.pair,'base64'));
await fs.writeFile(`${root}/overview-ipad.png`,Buffer.from(result.sheet,'base64'));
const checks=JSON.parse(await fs.readFile(`${root}/src/ipad-render-checks.json`,'utf8'));
let textMatches=true;
for(const i of [0,2,3,4,5,6,7]){
 await page.goto(`file:///${root}/src/previews.html?slide=${i===0?'pair':i+1}`);
 const text=await page.evaluate(()=>[...document.querySelectorAll('header')].map(el=>el.innerText));
 if(JSON.stringify(text)!==JSON.stringify(checks[i].text))textMatches=false;
}
const hashes=JSON.parse(await fs.readFile(`${root}/src/ipad-original-hashes.json`,'utf8'));
let iphoneUnchanged=true;for(const n of names)if(hashes[n]!==crypto.createHash('sha256').update(await fs.readFile(`${root}/iphone-6.9/${n}.png`)).digest('hex'))iphoneUnchanged=false;
const report={images:names.map((n,i)=>({file:n+'.png',width:result.dimensions[i][0],height:result.dimensions[i][1]})),pair:{width:4128,height:2752},seam:result.seam,chipTabletGap:result.chipTabletGap,textMatches,iphoneUnchanged};
if(!textMatches||!iphoneUnchanged||result.chipTabletGap<0||result.dimensions.some(([w,h])=>w!==2064||h!==2752))throw Error(JSON.stringify(report));
await fs.writeFile(`${root}/src/validation-ipad.json`,JSON.stringify(report,null,2));
await fs.writeFile(`${root}/index-ipad.html`,`<!doctype html><html lang="ko"><meta charset="utf-8"><title>링고루프 iPad 미리보기 8장</title><style>body{margin:36px;background:#eee;font-family:system-ui}section{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}img{width:100%}a{color:#141441;text-decoration:none}</style><h1>링고루프 iPad 미리보기</h1><p>2064 × 2752 px · PNG · <a href="pair-check-ipad.png">01–02 연결 보기</a></p><section>${names.map(n=>`<a href="ipad-13/${n}.png"><img src="ipad-13/${n}.png"><p>${n}.png</p></a>`).join('')}</section></html>`);
console.log(report);

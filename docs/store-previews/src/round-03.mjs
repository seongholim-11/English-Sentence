const fs=await import('node:fs/promises');
const root='D:/personal_project/English-Sentence/docs/store-previews';
const task=await taskSpace(10),page=task.page('p1');
console.log(await page.url());
const wide=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:2640,height:2868,scale:1}});
const names=['01-loop','02-cards','03-review','04-study','05-decks','06-quiz','07-dialogue','08-stats'];
const images=[];
for(const name of names){const bytes=await fs.readFile(`${root}/iphone-6.9/${name}.png`);images.push(`data:image/png;base64,${bytes.toString('base64')}`);}
const result=await page.evaluate(async({images,wide})=>{
 const load=async(src)=>{const im=new Image();im.src=src;await im.decode();return im;};
 const ims=await Promise.all(images.map(load));
 const pair=document.createElement('canvas');pair.width=2640;pair.height=2868;const ctx=pair.getContext('2d');ctx.drawImage(ims[0],0,0);ctx.drawImage(ims[1],1320,0);
 const wc=document.createElement('canvas');wc.width=2640;wc.height=2868;const wctx=wc.getContext('2d');wctx.drawImage(await load('data:image/png;base64,'+wide),0,0);
 const a=ctx.getImageData(1312,0,16,2868).data,b=wctx.getImageData(1312,0,16,2868).data;let seamMismatch=0,maxDiff=0;
 for(let i=0;i<a.length;i++){if(a[i]!==b[i])seamMismatch++;maxDiff=Math.max(maxDiff,Math.abs(a[i]-b[i]));}
 const sheet=document.createElement('canvas');sheet.width=1320;sheet.height=1434;const sctx=sheet.getContext('2d');ims.forEach((im,i)=>sctx.drawImage(im,(i%4)*330,Math.floor(i/4)*717,330,717));
 return {dimensions:ims.map(im=>({width:im.width,height:im.height})),seamMismatch,maxDiff,pair:pair.toDataURL('image/png').split(',')[1],sheet:sheet.toDataURL('image/png').split(',')[1]};
},{images,wide:wide.data});
await fs.writeFile(`${root}/pair-check.png`,Buffer.from(result.pair,'base64'));
await fs.writeFile(`${root}/overview.png`,Buffer.from(result.sheet,'base64'));
const report={images:result.dimensions.map((x,i)=>({...x,file:`${names[i]}.png`})),pair:{width:2640,height:2868},seam:{comparedTo:'continuous 2640px browser render, 16px boundary strip',mismatchedChannels:result.seamMismatch,maxChannelDifference:result.maxDiff}};
await fs.writeFile(`${root}/src/validation.json`,JSON.stringify(report,null,2));
await fs.writeFile(`${root}/index.html`,`<!doctype html><html lang="ko"><meta charset="utf-8"><title>링고루프 앱스토어 미리보기 8장</title><style>body{margin:36px;background:#eee;font-family:system-ui}h1{font-size:25px}section{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}img{width:100%;display:block}a{color:#141441;text-decoration:none}p{margin:8px 0 24px}</style><h1>링고루프 앱스토어 미리보기</h1><p>1320 × 2868 px · PNG · <a href="pair-check.png">01–02 연결 보기</a></p><section>${names.map(n=>`<a href="iphone-6.9/${n}.png"><img src="iphone-6.9/${n}.png"><p>${n}.png</p></a>`).join('')}</section></html>`);
console.log(report);

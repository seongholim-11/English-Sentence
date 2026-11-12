const fs=await import('node:fs/promises');
const crypto=await import('node:crypto');
const root='D:/personal_project/English-Sentence/docs/store-previews';
const names=['01-loop','02-cards','03-review','04-study','05-decks','06-quiz','07-dialogue','08-stats'];
const hash=async name=>crypto.createHash('sha256').update(await fs.readFile(`${root}/iphone-6.9/${name}.png`)).digest('hex');
const before=Object.fromEntries(await Promise.all(names.map(async n=>[n,await hash(n)])));
const task=await taskSpace('Lingoloop preview fixes 20261112');console.log({spaceId:task.spaceId});
const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1320,height:2868,deviceScaleFactor:1,mobile:false});
for(const [slide,half,name] of [['pair',1,'01-loop'],['pair',2,'02-cards'],['7',1,'07-dialogue']]){
 await page.goto(`file:///${root}/src/previews.html?slide=${slide}&half=${half}`);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
 const png=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:1320,height:2868,scale:1}});
 await fs.writeFile(`${root}/iphone-6.9/${name}.png`,Buffer.from(png.data,'base64'));
 console.log({saved:name,bytes:Buffer.from(png.data,'base64').length});
}
await page.cdp('Emulation.setDeviceMetricsOverride',{width:2640,height:2868,deviceScaleFactor:1,mobile:false});
await page.goto(`file:///${root}/src/previews.html?slide=pair`);
await page.evaluate(async()=>{document.documentElement.style.width='2640px';document.body.style.width='2640px';await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
const wide=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:2640,height:2868,scale:1}});
const images=[];for(const n of names)images.push(`data:image/png;base64,${(await fs.readFile(`${root}/iphone-6.9/${n}.png`)).toString('base64')}`);
const result=await page.evaluate(async({images,wide})=>{
 const load=async src=>{const im=new Image();im.src=src;await im.decode();return im;};
 const ims=await Promise.all(images.map(load));
 const pair=document.createElement('canvas');pair.width=2640;pair.height=2868;const ctx=pair.getContext('2d');ctx.drawImage(ims[0],0,0);ctx.drawImage(ims[1],1320,0);
 const wc=document.createElement('canvas');wc.width=2640;wc.height=2868;const wctx=wc.getContext('2d');wctx.drawImage(await load('data:image/png;base64,'+wide),0,0);
 const a=ctx.getImageData(1312,0,16,2868).data,b=wctx.getImageData(1312,0,16,2868).data;let seamMismatch=0,maxDiff=0;for(let i=0;i<a.length;i++){if(a[i]!==b[i])seamMismatch++;maxDiff=Math.max(maxDiff,Math.abs(a[i]-b[i]));}
 const sheet=document.createElement('canvas');sheet.width=1320;sheet.height=1434;const sctx=sheet.getContext('2d');ims.forEach((im,i)=>sctx.drawImage(im,(i%4)*330,Math.floor(i/4)*717,330,717));
 const chips=[...document.querySelectorAll('.chip')].map(e=>({blur:getComputedStyle(e).backdropFilter,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}));
 return {dimensions:ims.map(im=>({width:im.width,height:im.height})),seamMismatch,maxDiff,chips,pair:pair.toDataURL('image/png').split(',')[1],sheet:sheet.toDataURL('image/png').split(',')[1]};
},{images,wide:wide.data});
await fs.writeFile(`${root}/pair-check.png`,Buffer.from(result.pair,'base64'));
await fs.writeFile(`${root}/overview.png`,Buffer.from(result.sheet,'base64'));
const unchanged=[];for(const n of names.filter(n=>!['01-loop','02-cards','07-dialogue'].includes(n))){if(before[n]!==await hash(n))throw Error(`Unexpected change: ${n}`);unchanged.push(n);}
const report={images:result.dimensions.map((x,i)=>({...x,file:`${names[i]}.png`})),pair:{width:2640,height:2868},seam:{mismatchedChannels:result.seamMismatch,maxChannelDifference:result.maxDiff},chips:result.chips,unchanged};
await fs.writeFile(`${root}/src/validation.json`,JSON.stringify(report,null,2));console.log(report);

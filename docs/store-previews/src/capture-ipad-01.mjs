const fs=await import('node:fs/promises');
const crypto=await import('node:crypto');
const root='D:/personal_project/English-Sentence/docs/store-previews';
const names=['01-loop','02-cards','03-review','04-study','05-decks','06-quiz','07-dialogue','08-stats'];
const originals={};
for(const n of names)originals[n]=crypto.createHash('sha256').update(await fs.readFile(`${root}/iphone-6.9/${n}.png`)).digest('hex');
await fs.writeFile(`${root}/src/ipad-original-hashes.json`,JSON.stringify(originals,null,2));
const task=await taskSpace('Lingoloop iPad previews 20261112');console.log({spaceId:task.spaceId});
await fs.writeFile(`${root}/src/ipad-space.json`,JSON.stringify({spaceId:task.spaceId}));
const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:2064,height:2752,deviceScaleFactor:1,mobile:false});
const checks=[];
for(let i=0;i<names.length;i++){
 const slide=i<2?'pair':String(i+1),half=i===1?2:1;
 await page.goto(`file:///${root}/src/previews-ipad.html?slide=${slide}&half=${half}`);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
 const check=await page.evaluate(()=>({text:[...document.querySelectorAll('header')].map(el=>el.innerText),fonts:document.fonts.check('700 100px Plex'),overflow:[...document.querySelectorAll('h1 span,h1 strong,header p')].filter(el=>el.scrollWidth>el.clientWidth).map(el=>el.textContent),screens:[...document.querySelectorAll('.app-screen')].map(el=>({natural:[el.naturalWidth,el.naturalHeight],rendered:[el.clientWidth,el.clientHeight]}))}));
 if(check.overflow.length||!check.fonts)throw Error(JSON.stringify(check));
 const png=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:2064,height:2752,scale:1}});
 await fs.writeFile(`${root}/ipad-13/${names[i]}.png`,Buffer.from(png.data,'base64'));
 checks.push({file:names[i]+'.png',...check});console.log({saved:names[i]});
}
await fs.writeFile(`${root}/src/ipad-render-checks.json`,JSON.stringify(checks,null,2));

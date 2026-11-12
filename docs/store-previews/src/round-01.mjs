const fs = await import('node:fs/promises');
const task = await taskSpace('Lingoloop store previews 20261112');
console.log({spaceId:task.spaceId});
const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1320,height:2868,deviceScaleFactor:1,mobile:false});
const root='D:/personal_project/English-Sentence/docs/store-previews';
const jobs=[['pair','01-loop',1],['pair','02-cards',2],['3','03-review'],['4','04-study'],['5','05-decks'],['6','06-quiz'],['7','07-dialogue'],['8','08-stats']];
for(const [id,name,half] of jobs){
 await page.goto(`file:///${root}/src/previews.html?slide=${id}&half=${half||1}`);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
 const checks=await page.evaluate(()=>({fonts:document.fonts.check('700 124px Plex'),images:[...document.images].every(im=>im.complete&&im.naturalWidth>0),text:[...document.querySelectorAll('h1,p,.chip')].map(e=>e.textContent),overflow:[...document.querySelectorAll('h1 span,h1 strong,header p')].filter(e=>e.scrollWidth>e.clientWidth).map(e=>e.textContent)}));
 const png=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:1320,height:2868,scale:1}});
 await fs.writeFile(`${root}/iphone-6.9/${name}.png`,Buffer.from(png.data,'base64'));
 console.log({name,...checks});
}
await page.goto(`file:///${root}/src/previews.html?slide=pair`);
await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(im=>im.decode()));});
const pair=await page.cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y:0,width:2640,height:2868,scale:1}});
await fs.writeFile(`${root}/pair-check.png`,Buffer.from(pair.data,'base64'));
console.log('Saved pair-check.png');

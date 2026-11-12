const fs=await import('node:fs/promises');
const {spaceId}=JSON.parse(await fs.readFile('D:/personal_project/English-Sentence/docs/store-previews/src/ipad-space.json','utf8'));
const task=await taskSpace(spaceId);
await task.finish({keep:[]});
console.log('Finished iPad preview capture task');

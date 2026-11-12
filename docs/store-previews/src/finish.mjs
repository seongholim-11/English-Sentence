const task=await taskSpace(10);
await task.finish({keep:[]});
console.log('Closed preview rendering browser task.');

const fs=require('fs'),vm=require('vm'),assert=require('assert');
// Pass the same official Three.js r128 UMD file used by the game. DOM and WebGLRenderer are stubs: this suite validates logic, not rendering.
if(!process.argv[2])throw new Error('Usage: node scripts/test-pokopoko-v3.cjs /path/to/three-r128.min.js');
const three=fs.readFileSync(process.argv[2],'utf8');
const root=require('path').resolve(__dirname,'..')+'/';
function boot(version,initial={}){
 const store=new Map(Object.entries(initial)),nodes=new Map();
 const element=()=>({style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},listeners:{},addEventListener(k,f){this.listeners[k]=f},appendChild(){},setPointerCapture(){},getBoundingClientRect(){return {left:0,top:0,width:100,height:100}},remove(){}});
 const get=s=>{if(!nodes.has(s))nodes.set(s,element());return nodes.get(s)};
 const ctx={console,performance,Date,Math,setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,clearInterval(){},requestAnimationFrame(){},innerWidth:1280,innerHeight:800,devicePixelRatio:1,addEventListener(){},document:{querySelector:get,querySelectorAll:()=>[],createElement:element,body:element(),addEventListener(){},hidden:false},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
 ctx.window=ctx;vm.createContext(ctx);vm.runInContext(three,ctx);
 ctx.THREE.WebGLRenderer=class{constructor(){this.shadowMap={}}setPixelRatio(){}setSize(){}render(){}};
 const html=fs.readFileSync(root+'public/games/pokopoko_island_v'+version+'.html','utf8');
 const code=[...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
 vm.runInContext(code,ctx);return {run:s=>vm.runInContext(s,ctx),store,nodes};
}
const fixture={schemaVersion:2,chosen:'pon',missions:[true,false,true],unlocked:true,introClear:false,hasSave:true,worldEdits:[{x:8,y:19,z:9,type:5},{x:3,y:6,z:2,type:0}],stats:{score:91,fruit:4,friend:1,placed:7,broken:2,maxY:20},animalSave:[{k:'hiyoko',f:1,s:1,x:3,y:8,z:4,hx:3,hy:8,hz:4}],fruitSave:[1,0,1],playerSave:{x:3,y:9,z:3,fly:1},tod:.33,selBlockSave:5};
const old=JSON.stringify(fixture);
const v2=boot(2,{pokopoko_island_v2_progress:old});v2.run('startGame();state="play"');
const v3=boot(3,{pokopoko_island_v2_progress:old});v3.run('startGame();state="play"');
assert.equal(v3.store.get('pokopoko_island_v2_progress'),old);
assert.equal(v3.run('progress.schemaVersion'),3);
assert.equal(v3.run('JSON.stringify([...world])'),v2.run('JSON.stringify([...world])'));
for(const expr of ['JSON.stringify(player.pos)','JSON.stringify(stats)','JSON.stringify(progress.missions)','chosen.id','animals[0].stay','player.flying','selBlock'])assert.equal(v3.run(expr),v2.run(expr),expr);
console.log('PASS: v2 migration preserves terrain, edits, character, stats, missions, animal stay, flight and selected block; v2 bytes unchanged');
v3.run('writeSave()');const round=boot(3,Object.fromEntries(v3.store));round.run('startGame();state="play"');assert.equal(round.run('JSON.stringify([...world])'),v3.run('JSON.stringify([...world])'));
console.log('PASS: v3 save/reload roundtrip');
const v1fixture={...fixture,schemaVersion:1,migratedFromV1:false};const migrated=boot(3,{pokopoko_island_v1_progress:JSON.stringify(v1fixture)});migrated.run('startGame()');assert.equal(migrated.run('progress.terrainProfile'),'v1-central');
console.log('PASS: direct v1 migration preserves terrain profile');
const fresh=boot(3);fresh.run('startGame();state="play";const originalCell=getB(8,19,9);rememberEdit(8,19,9,5);setB(8,19,9,5);recordWorldEdit(8,19,9,5);rebuildAffected(8,9)');fresh.nodes.get('#undoBtn').listeners.click();assert.equal(fresh.run('getB(8,19,9)'),fresh.run('originalCell'));assert.equal(fresh.run('undoStack.length'),0);
fresh.run('player.pos.set(8.5,19,9.5);setB(8,19,9,5);rememberEdit(8,19,9,0);setB(8,19,9,0)');fresh.nodes.get('#undoBtn').listeners.click();assert.equal(fresh.run('undoStack.length'),1);assert.equal(fresh.run('getB(8,19,9)'),0);
console.log('PASS: undo restores previous cell and refuses to entomb player');
fresh.run('startGame();state="play";for(let i=0;i<600;i++){step(1/60);visualTime+=1/60;updateNature(1/60)}');assert(fresh.run('[player.pos.x,player.pos.y,player.pos.z].every(Number.isFinite)'));assert(fresh.run('natureGroup.children.every(o=>[o.position.x,o.position.y,o.position.z].every(Number.isFinite))'));
console.log('PASS: 600 simulation frames remain finite (no rendering)');
const initialCount=fresh.run('natureGroup.children.length');fresh.run('for(let i=0;i<5;i++)startGame()');assert.equal(fresh.run('natureGroup.children.length'),initialCount);assert.equal(fresh.run('undoStack.length'),0);
console.log('PASS: 5 restarts keep decoration count bounded and clear undo');
console.log('NOT TESTED: shader compilation, WebGL rendering, visual layout, mobile performance');

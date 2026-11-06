'use strict';
// Extends SHAMASH-AGENT-EXCHANGE-01. No AI, network, git mutation or owner decisions.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const schema=JSON.parse(fs.readFileSync(path.join(__dirname,'schema.json'),'utf8'));
const zero='0'.repeat(64),maxBytes=2*1024*1024;
function insist(ok,code){if(!ok)throw Error(code);}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
const hash=v=>crypto.createHash('sha256').update(canonical(v)).digest('hex');
const same=(a,b)=>canonical(a)===canonical(b);
// Dependency-free validator for precisely the JSON Schema keywords in schema.json.
// Fail closed when the schema introduces an unsupported keyword.
const keywords=new Set(['$schema','title','$defs','$ref','oneOf','type','properties','required','additionalProperties','items','maxItems','minItems','pattern','minLength','maxLength','const','enum','minimum']);
function checkSchema(s,depth=0){
  insist(s&&typeof s==='object'&&!Array.isArray(s)&&depth<40,'SCHEMA_INVALID');
  for(const k of Object.keys(s))insist(keywords.has(k),'SCHEMA_KEYWORD_UNSUPPORTED');
  if(s.type)insist(['object','array','string','integer'].includes(s.type),'SCHEMA_TYPE_UNSUPPORTED');
  for(const child of [...Object.values(s.properties||{}),...Object.values(s.$defs||{}),...(s.oneOf||[]),...(s.items?[s.items]:[])])checkSchema(child,depth+1);
}
checkSchema(schema);
function matches(s,v,depth=0){
  if(depth>40)return false;
  if(s.$ref){const name=s.$ref.replace('#/$defs/','');return s.$ref==='#/$defs/'+name&&Object.hasOwn(schema.$defs,name)&&matches(schema.$defs[name],v,depth+1);}
  if(s.oneOf&&s.oneOf.filter(x=>matches(x,v,depth+1)).length!==1)return false;
  if(Object.hasOwn(s,'const')&&!same(v,s.const))return false;
  if(s.enum&&!s.enum.some(x=>same(x,v)))return false;
  if(s.type==='object'){
    if(!v||typeof v!=='object'||Array.isArray(v))return false;
    if((s.required||[]).some(k=>!Object.hasOwn(v,k)))return false;
    if(s.additionalProperties===false&&Object.keys(v).some(k=>!Object.hasOwn(s.properties||{},k)))return false;
    if(Object.entries(s.properties||{}).some(([k,sub])=>Object.hasOwn(v,k)&&!matches(sub,v[k],depth+1)))return false;
  }
  if(s.type==='array'&&(!Array.isArray(v)||v.length>(s.maxItems??Infinity)||v.length<(s.minItems??0)||v.some(x=>!matches(s.items,x,depth+1))))return false;
  if(s.type==='string'&&(typeof v!=='string'||v.length<(s.minLength??0)||v.length>(s.maxLength??Infinity)||(s.pattern&&!new RegExp(s.pattern).test(v))))return false;
  if(s.type==='integer'&&(!Number.isSafeInteger(v)||v<(s.minimum??-Infinity)))return false;
  return true;
}
function validateShape(record,kind=record?.kind){insist(Object.hasOwn(schema.$defs,kind||'')&&matches(schema.$defs[kind],record),'RECORD_SCHEMA');return true;}
function validateRecord(record,registered=new Map()){
  validateShape(record);const p=record.payload;
  if(record.kind==='task'){
    insist(['owner','coordinator'].includes(record.producer.role)&&record.recipient.role==='implementer'&&p.reviewer.role==='reviewer','ACTOR_ROLE');
    insist(record.recipient.id!==p.reviewer.id,'SELF_REVIEW');
    for(const values of [p.allowed_actions,p.allowed_files])insist(new Set(values).size===values.length,'DUPLICATE_SCOPE');
  }else{
    const implementation=record.kind==='independent_review'?registered.get(p.implementation_record_id):record;
    insist(implementation&&implementation.kind==='implementation_result','IMPLEMENTATION_LINK');
    const task=registered.get(implementation.payload.task_record_id);
    insist(task&&task.kind==='task'&&task.task_id===record.task_id&&task.commit_sha===record.commit_sha&&implementation.task_id===record.task_id&&implementation.commit_sha===record.commit_sha,'TASK_SHA_LINK');
    if(record.kind==='implementation_result'){
      insist(same(record.producer,task.recipient)&&same(record.recipient,task.payload.reviewer),'RESULT_ACTOR');
      insist(p.changed_files.every(f=>task.payload.allowed_files.includes(f))&&new Set(p.changed_files).size===p.changed_files.length,'FILE_SCOPE');
      insist(p.changed_files.length===0||task.payload.allowed_actions.includes('WRITE_ALLOWED_FILES'),'ACTION_SCOPE');
    }else{
      insist(same(record.producer,task.payload.reviewer)&&record.producer.id!==implementation.producer.id&&['owner','coordinator'].includes(record.recipient.role),'REVIEW_ACTOR');
      insist(p.verdict!=='PASS'||p.findings.length===0,'PASS_FINDINGS');
      insist(!['FAIL','PASS_WITH_FINDINGS'].includes(p.verdict)||p.findings.length>0,'FINDINGS_REQUIRED');
      insist(p.verdict!=='BLOCKED'||p.findings.length+p.limitations.length>0,'BLOCK_REASON_REQUIRED');
      const expected=p.verdict==='BLOCKED'?'BLOCKED':p.verdict==='NOT_REVIEWED'?'NOT_REVIEWED':'REVIEWED';
      insist(record.status===expected,'REVIEW_STATUS');
    }
  }
  return true;
}
function eventDigest(event){const {event_hash,...unsigned}=event;return hash(unsigned);}
function makeEvent(events,record,type,consumerId){
  const seq=events.length+1;
  const event={schema_version:1,sequence:seq,event_id:'EXCHANGE-EVENT-'+String(seq).padStart(6,'0'),type,record_id:record.record_id,task_id:record.task_id,commit_sha:record.commit_sha,
    record_sha256:hash(record),consumer_id:consumerId,previous_hash:events.at(-1)?.event_hash||zero,mode:'LOCAL_SYNTHETIC_EXCHANGE_ONLY'};
  event.event_hash=eventDigest(event);return event;
}
function validateBundle(records,events){
  insist(Array.isArray(records)&&Array.isArray(events)&&records.length<=1000&&events.length<=10000,'BUNDLE_LIMIT');
  const all=new Map(),registered=new Map(),processing=new Map(),ids=new Set();
  for(const r of records){validateShape(r);insist(!all.has(r.record_id),'RECORD_ID_COLLISION');all.set(r.record_id,r);}
  let previous=zero;
  for(let i=0;i<events.length;i++){
    const e=events[i];validateShape(e,'event');
    insist(e.sequence===i+1&&!ids.has(e.event_id)&&e.previous_hash===previous&&e.event_hash===eventDigest(e),'HISTORY_CHAIN');
    ids.add(e.event_id);previous=e.event_hash;const r=all.get(e.record_id);
    insist(r&&e.record_sha256===hash(r)&&e.task_id===r.task_id&&e.commit_sha===r.commit_sha,'HISTORY_RECORD_LINK');
    insist(e.consumer_id===r.recipient.id,'CONSUMER_NOT_ASSIGNED');
    if(e.type==='RECORD_ADDED'){
      insist(!registered.has(r.record_id),'RECORD_REPLAY');validateRecord(r,registered);registered.set(r.record_id,r);
    }else{
      insist(registered.has(r.record_id),'RECORD_NOT_REGISTERED');const prior=processing.get(r.record_id);
      if(e.type==='CLAIMED')insist(!prior,'DUPLICATE_PROCESSING');
      else insist(prior==='CLAIMED','PROCESSING_TRANSITION');
      processing.set(r.record_id,e.type);
    }
  }
  insist(registered.size===all.size,'ORPHAN_RECORD_REVIEW_REQUIRED');
  return {records:registered,processing,head:previous,owner_decision:'REQUIRED_NOT_GRANTED'};
}
function readFile(file,max=maxBytes){const s=fs.lstatSync(file);insist(s.isFile()&&!s.isSymbolicLink()&&s.size<=max,'LOCAL_FILE_UNSAFE');return fs.readFileSync(file,'utf8');}
function readHistory(file){return fs.existsSync(file)?readFile(file).split(/\r?\n/).filter(Boolean).map(line=>JSON.parse(line)):[];}
function loadStore(root){
  const dir=path.join(root,'records');
  if(fs.existsSync(root))insist(fs.lstatSync(root).isDirectory()&&!fs.lstatSync(root).isSymbolicLink(),'STORE_SYMLINK');
  if(fs.existsSync(dir))insist(fs.lstatSync(dir).isDirectory()&&!fs.lstatSync(dir).isSymbolicLink(),'STORE_SYMLINK');
  const events=readHistory(path.join(root,'history.jsonl'));
  const records=fs.existsSync(dir)?fs.readdirSync(dir).map(name=>{insist(/^[A-Z][A-Z0-9_-]{2,63}\.json$/.test(name),'RECORD_FILENAME');const r=JSON.parse(readFile(path.join(dir,name),128*1024));insist(name===r.record_id+'.json','RECORD_FILENAME');return r;}):[];
  return {records,events,state:validateBundle(records,events)};
}
function locked(root,fn){
  fs.mkdirSync(root,{recursive:true});insist(!fs.lstatSync(root).isSymbolicLink(),'STORE_SYMLINK');root=fs.realpathSync(root);
  const lock=path.join(root,'exchange.lock');let fd;
  try{fd=fs.openSync(lock,'wx',0o600);}catch{throw Error('STORE_LOCKED_OWNER_REVIEW_REQUIRED');}
  try{return fn(root);}finally{fs.closeSync(fd);fs.unlinkSync(lock);}
}
function writeRecord(file,record){const fd=fs.openSync(file,'wx',0o600);try{fs.writeFileSync(fd,canonical(record)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
function appendEvent(root,event){const fd=fs.openSync(path.join(root,'history.jsonl'),'a',0o600);try{fs.writeFileSync(fd,canonical(event)+'\n');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
function publish(root,record){
  return locked(root,dir=>{
    const store=loadStore(dir),existing=store.state.records.get(record?.record_id);
    if(existing){insist(hash(existing)===hash(record),'RECORD_ID_COLLISION');return {status:'ALREADY_REGISTERED',record_sha256:hash(record)};}
    validateRecord(record,store.state.records);
    const recordDir=path.join(dir,'records');fs.mkdirSync(recordDir,{recursive:true});insist(!fs.lstatSync(recordDir).isSymbolicLink(),'STORE_SYMLINK');
    const event=makeEvent(store.events,record,'RECORD_ADDED',record.recipient.id);
    writeRecord(path.join(recordDir,record.record_id+'.json'),record);appendEvent(dir,event);
    return {status:'REGISTERED',record_sha256:hash(record),event_hash:event.event_hash};
  });
}
function acknowledge(root,recordId,consumerId,type){
  insist(['CLAIMED','COMPLETED','BLOCKED'].includes(type),'PROCESSING_ACTION');
  return locked(root,dir=>{
    const store=loadStore(dir),record=store.state.records.get(recordId);insist(record,'RECORD_NOT_REGISTERED');
    const event=makeEvent(store.events,record,type,consumerId);
    validateBundle(store.records,[...store.events,event]);appendEvent(dir,event);
    return {status:type,event_hash:event.event_hash,owner_decision:'REQUIRED_NOT_GRANTED'};
  });
}
function checkFixtures(){
  const fixture=JSON.parse(readFile(path.join(__dirname,'fixtures.json'))),events=readHistory(path.join(__dirname,'history.jsonl'));
  insist(fixture.mode==='SIMULATED_NOT_AN_AGENT_RUN','FIXTURE_PROVENANCE');
  const state=validateBundle(fixture.records,events);
  return {status:'STRUCTURE_PASS_ONLY',records:state.records.size,events:events.length,head:state.head,independent_audit:'NOT_REVIEWED',owner_decision:state.owner_decision};
}
module.exports={schema,canonical,hash,eventDigest,makeEvent,validateShape,validateRecord,validateBundle,loadStore,publish,acknowledge,checkFixtures};
if(require.main===module){try{insist(process.argv.length===2||process.argv[2]==='check','CHECK_ONLY_CLI');console.log(JSON.stringify(checkFixtures(),null,2));}catch{console.error('EXCHANGE_STRUCTURE_BLOCKED');process.exitCode=1;}}

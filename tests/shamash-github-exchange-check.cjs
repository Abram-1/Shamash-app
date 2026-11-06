'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const e=require('../automation/exchange/exchange.cjs');
const fixture=require('../automation/exchange/fixtures.json');
const scratch=fs.mkdtempSync(path.join(__dirname,'exchange-test-'));
const tests=[];const clone=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',reason:error.message});}}
function eventsFor(records){const out=[];for(const r of records)out.push(e.makeEvent(out,r,'RECORD_ADDED',r.recipient.id));return out;}
function verify(records){return e.validateBundle(records,eventsFor(records));}
function store(name){return path.join(scratch,name);}
try{
  test('Three distinct versioned formats; exact-SHA links; no real-agent claim',()=>{
    const r=e.checkFixtures();assert.equal(r.records,3);assert.equal(r.events,5);assert.equal(r.owner_decision,'REQUIRED_NOT_GRANTED');assert.equal(r.independent_audit,'NOT_REVIEWED');
  });
  test('Missing ID/version, unknown status, real-data and extra authority fields rejected',()=>{
    for(const patch of [{schema_version:2},{status:'APPROVED'},{data_classification:'REAL'},{owner_decision:'APPROVED'},{owner_approved:true}]){
      const records=clone(fixture.records);Object.assign(records[0],patch);assert.throws(()=>verify(records));
    }
    const records=clone(fixture.records);delete records[0].record_id;assert.throws(()=>verify(records));
  });
  test('Wrong SHA, task and result references rejected',()=>{
    for(const kind of ['sha','task','result']){
      const records=clone(fixture.records);
      if(kind==='sha')records[1].commit_sha='a'.repeat(40);
      if(kind==='task')records[1].payload.task_record_id='FOREIGN-TASK';
      if(kind==='result')records[2].payload.implementation_record_id='FOREIGN-RESULT';
      assert.throws(()=>verify(records));
    }
  });
  test('Scope rejects main/workflow/traversal paths and forbidden actions',()=>{
    for(const file of ['app.js','.github/workflows/shamash-static-checks.yml','automation/synthetic/../../app.js','C:\\app.js','automation\\synthetic\\sum.cjs']){
      const records=clone(fixture.records);records[0].payload.allowed_files=[file];assert.throws(()=>verify(records));
    }
    for(const action of ['MERGE','DEPLOY','PAY','OWNER_APPROVAL','PUSH']){const records=clone(fixture.records);records[0].payload.allowed_actions=[action];assert.throws(()=>verify(records));}
  });
  test('Result must stay within task action/file scope',()=>{
    const records=clone(fixture.records);records[1].payload.changed_files=['automation/synthetic/sum.cjs'];assert.throws(()=>verify(records),/ACTION_SCOPE/);
    records[0].payload.allowed_actions.push('WRITE_ALLOWED_FILES');verify(records);
    records[1].payload.changed_files=['automation/synthetic/other.cjs'];assert.throws(()=>verify(records),/FILE_SCOPE/);
  });
  test('Self-review and wrong assigned identities rejected',()=>{
    const records=clone(fixture.records);records[0].payload.reviewer.id='codex';assert.throws(()=>verify(records),/SELF_REVIEW/);
    const r=clone(fixture.records);r[2].producer={id:'codex',role:'reviewer'};assert.throws(()=>verify(r),/REVIEW_ACTOR/);
    const t=clone(fixture.records);t[1].producer.id='unassigned';assert.throws(()=>verify(t),/RESULT_ACTOR/);
  });
  test('Additional implementers/reviewers use unchanged formats',()=>{
    const r=clone(fixture.records);r[0].recipient.id='future-agent';r[0].payload.reviewer.id='another-reviewer';r[1].producer.id='future-agent';r[1].recipient.id='another-reviewer';r[2].producer.id='another-reviewer';verify(r);
  });
  test('Review verdict requires matching status and concrete findings',()=>{
    const r=clone(fixture.records);r[2].payload.verdict='FAIL';r[2].status='REVIEWED';verify(r);
    r[2].payload.findings=[];assert.throws(()=>verify(r),/FINDINGS_REQUIRED/);
    const s=clone(fixture.records);s[2].payload.verdict='PASS';assert.throws(()=>verify(s),/PASS_FINDINGS/);
    const t=clone(fixture.records);t[2].payload.findings[0].severity='CRITICAL';assert.throws(()=>verify(t),/RECORD_SCHEMA/);
  });
  test('Canonical content hash is independent of object key ordering',()=>{
    assert.equal(e.hash({a:1,b:2}),e.hash({b:2,a:1}));assert.notEqual(e.hash({a:1}),e.hash({a:2}));
  });
  test('History rejects changed records, reordering, chain substitution and duplicates',()=>{
    const records=clone(fixture.records),events=eventsFor(records);const changed=clone(records);changed[0].payload.authorization_ref='changed';assert.throws(()=>e.validateBundle(changed,events),/HISTORY_RECORD_LINK/);
    assert.throws(()=>e.validateBundle(records,[events[1],events[0],events[2]]),/HISTORY_CHAIN/);
    const changedEvents=clone(events);changedEvents[1].previous_hash='f'.repeat(64);assert.throws(()=>e.validateBundle(records,changedEvents),/HISTORY_CHAIN/);
    const duplicate=[...events,e.makeEvent(events,records[0],'RECORD_ADDED',records[0].recipient.id)];assert.throws(()=>e.validateBundle(records,duplicate),/RECORD_REPLAY/);
  });
  test('Missing history, orphan record and duplicate record ID rejected',()=>{
    assert.throws(()=>e.validateBundle(fixture.records,[]),/ORPHAN_RECORD/);
    assert.throws(()=>e.validateBundle([...fixture.records,fixture.records[0]],eventsFor(fixture.records)),/RECORD_ID_COLLISION/);
  });
  test('Persistent publish is idempotent without rewriting history',()=>{
    const root=store('publish');for(const r of fixture.records)e.publish(root,r);
    const before=fs.readFileSync(path.join(root,'history.jsonl'));const result=e.publish(root,fixture.records[0]);assert.equal(result.status,'ALREADY_REGISTERED');assert.deepEqual(fs.readFileSync(path.join(root,'history.jsonl')),before);
    const changed=clone(fixture.records[0]);changed.payload.authorization_ref='changed';assert.throws(()=>e.publish(root,changed),/RECORD_ID_COLLISION/);
  });
  test('Claims persist across reload and prevent duplicate processing after completion',()=>{
    const root=store('claims'),task=fixture.records[0];e.publish(root,task);e.acknowledge(root,task.record_id,'codex','CLAIMED');
    assert.equal(e.loadStore(root).state.processing.get(task.record_id),'CLAIMED');assert.throws(()=>e.acknowledge(root,task.record_id,'codex','CLAIMED'),/DUPLICATE_PROCESSING/);
    e.acknowledge(root,task.record_id,'codex','COMPLETED');assert.throws(()=>e.acknowledge(root,task.record_id,'codex','CLAIMED'),/DUPLICATE_PROCESSING/);
    assert.equal(e.loadStore(root).state.owner_decision,'REQUIRED_NOT_GRANTED');
  });
  test('Wrong recipient and completion without claim rejected without history change',()=>{
    const root=store('recipient'),task=fixture.records[0];e.publish(root,task);const before=fs.readFileSync(path.join(root,'history.jsonl'));
    assert.throws(()=>e.acknowledge(root,task.record_id,'claude','CLAIMED'),/CONSUMER_NOT_ASSIGNED/);
    assert.throws(()=>e.acknowledge(root,task.record_id,'codex','COMPLETED'),/PROCESSING_TRANSITION/);assert.deepEqual(fs.readFileSync(path.join(root,'history.jsonl')),before);
  });
  test('Blocked processing cannot auto-retry or complete',()=>{
    const root=store('blocked'),task=fixture.records[0];e.publish(root,task);e.acknowledge(root,task.record_id,'codex','CLAIMED');e.acknowledge(root,task.record_id,'codex','BLOCKED');
    assert.throws(()=>e.acknowledge(root,task.record_id,'codex','CLAIMED'),/DUPLICATE_PROCESSING/);assert.throws(()=>e.acknowledge(root,task.record_id,'codex','COMPLETED'),/PROCESSING_TRANSITION/);
  });
  test('Existing lock blocks concurrent writers; no automatic lock removal',()=>{
    const root=store('locked');fs.mkdirSync(root);fs.writeFileSync(path.join(root,'exchange.lock'),'existing');
    assert.throws(()=>e.publish(root,fixture.records[0]),/STORE_LOCKED/);assert.equal(fs.readFileSync(path.join(root,'exchange.lock'),'utf8'),'existing');
  });
  test('Interrupted record write and malformed history fail closed, retain evidence',()=>{
    const root=store('orphan');fs.mkdirSync(path.join(root,'records'),{recursive:true});const r=fixture.records[0];fs.writeFileSync(path.join(root,'records',r.record_id+'.json'),JSON.stringify(r));
    assert.throws(()=>e.publish(root,r),/ORPHAN_RECORD/);assert(fs.existsSync(path.join(root,'records',r.record_id+'.json')));
    const other=store('truncated');e.publish(other,r);fs.appendFileSync(path.join(other,'history.jsonl'),'{partial');assert.throws(()=>e.loadStore(other));
  });
  test('No live-agent provenance or owner approval can be smuggled into fixture',()=>{
    const r=clone(fixture.records);r[1].payload.execution_provenance='REAL_AGENT_RUN';assert.throws(()=>verify(r),/RECORD_SCHEMA/);
    const s=clone(fixture.records);s[2].payload.independence_status='VERIFIED';assert.throws(()=>verify(s),/RECORD_SCHEMA/);
  });
  console.log(JSON.stringify({scope:'GITHUB_EXCHANGE_01_LOCAL_STRUCTURAL_TESTS',tests,passed:tests.filter(t=>t.status==='PASS').length,failed:tests.filter(t=>t.status==='FAIL').length,independent_audit:'NOT_REVIEWED',owner_decision:'REQUIRED_NOT_GRANTED'},null,2));
  if(tests.some(t=>t.status==='FAIL'))process.exitCode=1;
}finally{if(path.dirname(scratch)===__dirname&&path.basename(scratch).startsWith('exchange-test-'))fs.rmSync(scratch,{recursive:true,force:true});}

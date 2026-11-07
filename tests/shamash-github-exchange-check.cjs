'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync} = require('node:child_process');
const e=require('../automation/exchange/exchange.cjs');
const fixture=require('../automation/exchange/fixtures.json');
const scratch=fs.mkdtempSync(path.join(__dirname,'exchange-test-'));
const tests=[];const clone=x=>JSON.parse(JSON.stringify(x));
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(error){tests.push({name,status:'FAIL',reason:error.message});}}
function eventsFor(records){const out=[];for(const r of records)out.push(e.makeEvent(out,r,'RECORD_ADDED',r.recipient.id));return out;}
function verify(records){return e.validateBundle(records,eventsFor(records));}
function store(name){return path.join(scratch,name);}
const publicationSha = 'e38f872095aec3f2ef8ae1f6bfc1b470a8a1d370';
// A separate test reference, kept unchanged when fixtures and history are rewritten.
const trustReference = Object.freeze({
  publication_commit_sha: publicationSha,
  task_id: 'DEMO-AUTOMATION-001',
  data_commit_sha: 'ab1ba30e2dbcfad1e8c201395bdfd02113f13a65',
  head: '9309de377b9bd7a232be2c67c12216621b0e8da24a17cb399b079ce201b0fb3b'
});
function runCheck(name, edit = () => {}, sha = publicationSha, reference = JSON.stringify(trustReference)) {
  const dir = store(name);
  fs.mkdirSync(dir);
  for (const file of ['exchange.cjs', 'schema.json', 'fixtures.json', 'history.jsonl']) {
    fs.copyFileSync(path.join(__dirname, '../automation/exchange', file), path.join(dir, file));
  }
  edit(dir);
  const env = {...process.env, GITHUB_ACTIONS: 'true', GITHUB_SHA: sha, SHAMASH_HANDOFF_REFERENCE: reference};
  if (sha === null) delete env.GITHUB_SHA;
  if (reference === null) delete env.SHAMASH_HANDOFF_REFERENCE;
  const run = spawnSync(process.execPath, [path.join(dir, 'exchange.cjs'), 'check'], {env, encoding: 'utf8'});
  if (run.error) throw run.error;
  return {exitCode: run.status, report: JSON.parse(run.stdout)};
}
function rewriteFixture(dir, records) {
  fs.writeFileSync(path.join(dir, 'fixtures.json'), JSON.stringify({...fixture, records}));
  fs.writeFileSync(path.join(dir, 'history.jsonl'), eventsFor(records).map(event => JSON.stringify(event)).join('\n') + '\n');
}
function assertFailedCheck(run, code, dataSha = null) {
  assert.equal(run.exitCode, 1);
  assert.equal(run.report.result, 'FAIL');
  assert.equal(run.report.error_code, code);
  assert.equal(run.report.data_commit_sha, dataSha);
  assert.equal(run.report.independent_audit, 'NOT_REVIEWED');
}
try{
  test('CI report separates publication SHA from validated synthetic data SHA', () => {
    const {exitCode, report} = runCheck('ci-pass');
    assert.equal(exitCode, 0);
    assert.equal(report.result, 'PASS');
    assert.equal(report.status, 'STRUCTURE_PASS_ONLY');
    assert.equal(report.publication_commit_sha, publicationSha);
    assert.equal(report.data_commit_sha, 'ab1ba30e2dbcfad1e8c201395bdfd02113f13a65');
    assert.equal(report.task_id, 'DEMO-AUTOMATION-001');
    assert.equal(report.independent_audit, 'NOT_REVIEWED');
    assert.equal(report.owner_decision, 'REQUIRED_NOT_GRANTED');
    assert.match(report.head, /^[0-9a-f]{64}$/);
  });
  test('CI rejects mismatched task ID or data SHA even with a rebuilt history', () => {
    for (const [field, value] of [['task_id', 'OTHER-TASK'], ['commit_sha', 'a'.repeat(40)]]) {
      const run = runCheck('ci-mismatch-' + field, dir => {
        const records = clone(fixture.records);
        records[2][field] = value;
        rewriteFixture(dir, records);
      });
      assertFailedCheck(run, 'TASK_SHA_LINK');
    }
  });
  test('CI requires the complete three-record chain', () => {
    assertFailedCheck(runCheck('ci-missing-review', dir => rewriteFixture(dir, fixture.records.slice(0, 2))), 'EXPECTED_HANDOFF_CHAIN');
  });
  test('CI reports damaged history and schema as machine-readable failures', () => {
    assertFailedCheck(runCheck('ci-tampered-history', dir => {
      const file = path.join(dir, 'history.jsonl');
      const events = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
      events[0].event_hash = 'f'.repeat(64);
      fs.writeFileSync(file, events.map(event => JSON.stringify(event)).join('\n') + '\n');
    }), 'HISTORY_CHAIN');
    assertFailedCheck(runCheck('ci-invalid-schema', dir => {
      fs.writeFileSync(path.join(dir, 'schema.json'), '{');
    }), 'HANDOFF_INPUT_INVALID');
  });
  test('CI requires a valid publication SHA', () => {
    assertFailedCheck(runCheck('ci-no-sha', undefined, null), 'PUBLICATION_SHA_INVALID');
    assertFailedCheck(runCheck('ci-invalid-sha', undefined, 'main'), 'PUBLICATION_SHA_INVALID');
  });
  test('CI blocks missing or invalid references and unapproved publication commits', () => {
    for (const [name, sha, reference, code] of [
      ['missing', publicationSha, null, 'TRUST_REFERENCE_MISSING'],
      ['empty', publicationSha, '', 'TRUST_REFERENCE_MISSING'],
      ['invalid', publicationSha, '{', 'TRUST_REFERENCE_INVALID'],
      ['unapproved', 'a'.repeat(40), JSON.stringify(trustReference), 'TRUST_PUBLICATION_UNAPPROVED']
    ]) {
      const {exitCode, report} = runCheck('ci-reference-' + name, undefined, sha, reference);
      assert.equal(exitCode, 1);
      assert.equal(report.result, 'BLOCKED');
      assert.equal(report.error_code, code);
      assert.equal(report.independent_audit, 'NOT_REVIEWED');
    }
  });
  test('CI rejects coordinated replacement of all data SHAs or task IDs with a rebuilt history', () => {
    for (const [field, value, code, dataSha] of [
      ['commit_sha', 'a'.repeat(40), 'REFERENCE_DATA_SHA_MISMATCH', 'a'.repeat(40)],
      ['task_id', 'OTHER-TASK', 'REFERENCE_TASK_ID_MISMATCH', trustReference.data_commit_sha]
    ]) {
      const run = runCheck('ci-coordinated-' + field, dir => {
        const records = clone(fixture.records);
        for (const record of records) record[field] = value;
        const file = path.join(dir, 'history.jsonl');
        const originalEvents = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/).map(line => JSON.parse(line));
        const events = [];
        for (const original of originalEvents) {
          const record = records.find(item => item.record_id === original.record_id);
          events.push(e.makeEvent(events, record, original.type, original.consumer_id));
        }
        // Confirm that internal structure still passes before applying the external reference.
        e.validateBundle(records, events);
        fs.writeFileSync(path.join(dir, 'fixtures.json'), JSON.stringify({...fixture, records}));
        fs.writeFileSync(file, events.map(event => JSON.stringify(event)).join('\n') + '\n');
      });
      assertFailedCheck(run, code, dataSha);
      assert.equal(run.report.publication_commit_sha, publicationSha);
    }
  });
  test('CI rejects a shortened but internally valid history', () => {
    const run = runCheck('ci-short-history', dir => rewriteFixture(dir, fixture.records));
    assertFailedCheck(run, 'REFERENCE_HISTORY_HEAD_MISMATCH', trustReference.data_commit_sha);
  });
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

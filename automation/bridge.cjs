'use strict';
// Narrow synthetic pilot. No arbitrary job execution, credentials, paid API or merge.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const BRANCH = 'automation/shamash-ci-setup-01';
const REPO = 'Abram-1/Shamash-app';
const task = JSON.parse(fs.readFileSync(path.join(__dirname, 'task.json'), 'utf8').replace(/^\uFEFF/, ''));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
function git(...args) { return cp.execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', timeout: 10000 }).trim(); }
function validateTask(t) {
  if (t.task_id !== 'DEMO-AUTOMATION-001' || t.branch !== BRANCH || t.test_data !== 'synthetic' ||
      t.requires_owner_approval_for_merge !== true || t.max_correction_attempts !== 2 || t.max_parallel_workers !== 1 ||
      JSON.stringify(t.allowed_files) !== JSON.stringify(['automation/synthetic/sum.cjs'])) throw Error('TASK_SCOPE_REJECTED');
  return true;
}
function validateCodeResult(r) {
  if (!r || Object.keys(r).sort().join(',') !== 'code,task_id' || r.task_id !== task.task_id ||
      typeof r.code !== 'string' || r.code.length > 6000 ||
      /require\s*\(|import\b|eval\s*\(|Function\s*\(|process\b|globalThis\b|fetch\b|child_process|__proto__|constructor|prototype/.test(r.code)) throw Error('CODE_RESULT_REJECTED');
  return true;
}
function safeRead(file) { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
function save(file, value) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
  fs.renameSync(tmp, file);
}
function auditRequest(sha, ciURL) {
  if (!/^[0-9a-f]{40}$/.test(sha) || !new RegExp('^https://github\\.com/Abram-1/Shamash-app/actions/runs/[0-9]+$').test(ciURL)) throw Error('INVALID_IMMUTABLE_CONTEXT');
  return { schema: 1, task, reviewed_commit_sha: sha, ci_url: ciURL,
    repository: REPO, required_verdicts: ['PASS', 'PASS_WITH_FINDINGS', 'FAIL', 'BLOCKED'],
    restrictions: ['Independent Claude execution required', 'No code changes', 'No paid API', 'No secrets', 'No main or merge'],
    state: 'AWAITING_CLAUDE', automatic_corrections_enabled: false, correction_attempts: 0 };
}
async function main(command) {
  validateTask(task);
  if (git('branch', '--show-current') !== BRANCH) throw Error('BRANCH_SCOPE_REJECTED');
  const dir = path.join(__dirname, 'runs'); fs.mkdirSync(dir, { recursive: true });
  const lock = path.join(dir, 'worker.lock');
  let fd;
  try { fd = fs.openSync(lock, 'wx'); } catch { throw Error('WORKER_LOCKED: inspect prior state; never auto-delete an active lock'); }
  fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, started_at: new Date().toISOString() }));
  const event = value => fs.appendFileSync(path.join(dir, 'events.jsonl'), JSON.stringify({ at: new Date().toISOString(), ...value }) + '\n');
  const stateFile = path.join(dir, 'state.json');
  const setState = value => { save(stateFile, value); event(value); return value; };
  try {
    event({ stage: command, event: 'STARTED', task_id: task.task_id });
    if (command === 'codex' || command === 'retry-codex') {
      const prior = fs.existsSync(stateFile) ? safeRead(stateFile) : null;
      const attempts = prior && prior.codex_invoked ? (prior.invocation_attempts || 1) : 0;
      if (attempts && (command !== 'retry-codex' || prior.stage !== 'BLOCKED' || attempts >= 2)) throw Error('RETRY_LIMIT_OR_STATE_REJECTED');
      if (attempts) for (const name of ['codex.stdout.jsonl', 'codex.stderr.txt']) {
        const file = path.join(dir, name); if (fs.existsSync(file)) fs.renameSync(file, file + '.attempt' + attempts);
      }
      const schema = { type: 'object', properties: { task_id: { type: 'string', enum: [task.task_id] }, code: { type: 'string' } }, required: ['task_id', 'code'], additionalProperties: false };
      save(path.join(dir, 'codex-schema.json'), schema);
      const output = path.join(dir, 'codex-result.json');
      const prompt = 'Synthetic SHAMASH pilot. No tools, no filesystem access, no commands, no network calls. Return only the requested JSON object. task_id DEMO-AUTOMATION-001. code must be dependency-free CommonJS defining function syntheticSum(a,b) and module.exports={syntheticSum}. Require Number.isSafeInteger for both inputs and the sum, throw RangeError otherwise. No side effects or extra exports. Do not claim any audit or approval.';
      setState({ stage: 'CODEX_RUNNING', task_id: task.task_id, codex_invoked: true, invocation_attempts: attempts + 1, base_commit_sha: git('rev-parse', 'HEAD') });
      const result = cp.spawnSync('codex', ['exec', '--sandbox', 'read-only', '--ephemeral', '--json', '--output-schema', path.join(dir, 'codex-schema.json'), '-o', output, prompt],
        { cwd: ROOT, input: '', encoding: 'utf8', timeout: 45000, maxBuffer: 2 * 1024 * 1024, windowsHide: true });
      fs.writeFileSync(path.join(dir, 'codex.stdout.jsonl'), result.stdout || '');
      fs.writeFileSync(path.join(dir, 'codex.stderr.txt'), result.stderr || '');
      if (result.status !== 0 || result.error || !fs.existsSync(output)) return setState({ stage: 'BLOCKED', dependency: 'CODEX_EXECUTION', codex_invoked: true, invocation_attempts: attempts + 1,
        reason: result.error ? result.error.code : 'CODEX_NONZERO_EXIT', exit_code: result.status, evidence: ['codex.stdout.jsonl', 'codex.stderr.txt'] });
      const response = safeRead(output); validateCodeResult(response);
      // No generated code is executed by the bridge. Separate tests run it in a bounded VM.
      fs.writeFileSync(path.join(ROOT, task.allowed_files[0]), response.code + '\n', { flag: 'wx' });
      const proof = { schema: 1, task_id: task.task_id, agent: 'Codex CLI',
        version: cp.execFileSync('codex', ['--version'], { encoding: 'utf8', timeout: 10000, windowsHide: true }).trim(),
        base_commit_sha: git('rev-parse', 'HEAD'), code_sha256: hash(response.code + '\n'),
        events_sha256: hash(result.stdout || ''), exit_code: 0, independent_review: 'NOT_REVIEWED' };
      save(path.join(__dirname, 'codex-proof.json'), proof);
      return setState({ stage: 'CODEX_COMPLETED', codex_invoked: true, invocation_attempts: attempts + 1, task_id: task.task_id, proof: 'automation/codex-proof.json', next: 'Commit approved isolated scope and wait for exact-SHA GitHub CI' });
    }
    if (command === 'ci') {
      if (process.env.GITHUB_REPOSITORY !== REPO || process.env.GITHUB_REF !== 'refs/heads/' + BRANCH || !/^[0-9a-f]{40}$/.test(process.env.GITHUB_SHA || '') || git('rev-parse', 'HEAD') !== process.env.GITHUB_SHA) throw Error('CI_IDENTITY_REJECTED');
      const url = `https://github.com/${REPO}/actions/runs/${process.env.GITHUB_RUN_ID}`;
      const request = auditRequest(process.env.GITHUB_SHA, url);
      request.implementation = fs.existsSync(path.join(__dirname, 'codex-proof.json')) ? safeRead(path.join(__dirname, 'codex-proof.json')) : null;
      request.synthetic_source = fs.existsSync(path.join(ROOT, task.allowed_files[0])) ? fs.readFileSync(path.join(ROOT, task.allowed_files[0]), 'utf8') : null;
      request.test_outcomes = { static: process.env.STATIC_OUTCOME || 'NOT_VERIFIED', bridge: process.env.BRIDGE_OUTCOME || 'NOT_VERIFIED' };
      save(path.join(dir, 'claude-request.json'), request);
      return setState({ stage: request.test_outcomes.static === 'success' && request.test_outcomes.bridge === 'success' ? 'PARTIAL_PASS' : 'BLOCKED', task_id: task.task_id, commit_sha: request.reviewed_commit_sha,
        ci_url: url, claude: 'BLOCKED', reason: 'No verified Claude runner/authentication/cost authorization; no secrets or paid API configured',
        request: 'claude-request.json', automatic_corrections_enabled: false });
    }
    if (command === 'status') return fs.existsSync(stateFile) ? safeRead(stateFile) : { stage: 'NOT_STARTED' };
    throw Error('SUPPORTED_COMMANDS: codex, retry-codex (one technical retry), ci, status');
  } catch (error) {
    // Preserve the first invocation flag so a failed run cannot create a billing loop.
    const prior = fs.existsSync(stateFile) ? safeRead(stateFile) : {};
    setState({ stage: 'BLOCKED', command, codex_invoked: prior.codex_invoked || false, invocation_attempts: prior.invocation_attempts || (prior.codex_invoked ? 1 : 0), reason: error.message });
    throw error;
  } finally { fs.closeSync(fd); fs.unlinkSync(lock); }
}
module.exports = { validateTask, validateCodeResult, auditRequest, hash, task };
if (require.main === module) main(process.argv[2] || 'status').then(r => {
  console.log(JSON.stringify(r, null, 2)); if (r.stage === 'BLOCKED') process.exitCode = 2;
}).catch(e => { console.error(e.message); process.exitCode = 2; });

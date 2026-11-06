'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { validateTask, validateCodeResult, auditRequest, hash, task } = require('../automation/bridge.cjs');
const results = [];
function test(name, fn) { try { fn(); results.push({ name, status: 'PASS' }); } catch (e) { results.push({ name, status: 'FAIL', reason: e.message }); } }
test('Owner synthetic task; reject real data, scope expansion and retry expansion', () => {
  validateTask(task);
  for (const patch of [{ test_data: 'real' }, { branch: 'main' }, { allowed_files: ['app.js'] }, { max_correction_attempts: 3 }, { max_parallel_workers: 3 }, { requires_owner_approval_for_merge: false }]) assert.throws(() => validateTask({ ...task, ...patch }));
});
test('Reject arbitrary generated imports and side-effect interfaces', () => {
  for (const code of ["require('fs')", 'process.exit()', 'import x', 'eval("x")', 'globalThis.fetch()', 'x.constructor']) assert.throws(() => validateCodeResult({ task_id: task.task_id, code }));
  assert.throws(() => validateCodeResult({ task_id: 'FOREIGN', code: '' }));
});
test('Exact immutable task and CI provenance; reject wrong SHA or repository', () => {
  const request = auditRequest('a'.repeat(40), 'https://github.com/Abram-1/Shamash-app/actions/runs/123');
  assert.equal(request.state, 'AWAITING_CLAUDE'); assert.equal(request.automatic_corrections_enabled, false);
  assert.throws(() => auditRequest('main', request.ci_url));
  assert.throws(() => auditRequest('a'.repeat(40), 'https://github.com/other/repo/actions/runs/123'));
});
test('Real Codex-generated synthetic code and proof hash', () => {
  const code = fs.readFileSync(path.join(__dirname, '../automation/synthetic/sum.cjs'), 'utf8');
  const proof = JSON.parse(fs.readFileSync(path.join(__dirname, '../automation/codex-proof.json'), 'utf8'));
  assert.equal(proof.task_id, task.task_id); assert.equal(proof.exit_code, 0); assert.equal(proof.code_sha256, hash(code));
  validateCodeResult({ task_id: task.task_id, code });
  const sandbox = vm.createContext({ module: { exports: {} } }, { codeGeneration: { strings: false, wasm: false } });
  vm.runInContext(code, sandbox, { timeout: 500 });
  for (const [a, b, expected] of [[0, 0, 0], [2, 3, 5], [-2, 3, 1], [Number.MAX_SAFE_INTEGER, 0, Number.MAX_SAFE_INTEGER], [Number.MIN_SAFE_INTEGER, 0, Number.MIN_SAFE_INTEGER]]) {
    sandbox.a = a; sandbox.b = b; assert.equal(vm.runInContext('module.exports.syntheticSum(a,b)', sandbox, { timeout: 500 }), expected);
  }
  for (const [a, b] of [[Number.MAX_SAFE_INTEGER, 1], [Number.MIN_SAFE_INTEGER, -1], [NaN, 0], [Infinity, 0], ['1', 2], [0.1, 1], [null, 1]]) {
    sandbox.a = a; sandbox.b = b; assert.throws(() => vm.runInContext('module.exports.syntheticSum(a,b)', sandbox, { timeout: 500 }));
  }
});
test('Workflow restricted branch, concurrency, readonly token and artifact preservation', () => {
  const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/shamash-static-checks.yml'), 'utf8');
  for (const text of ['automation/shamash-ci-setup-01', 'contents: read', 'persist-credentials: false', 'concurrency:', 'actions/upload-artifact@v4', 'always()', 'node automation/bridge.cjs ci']) assert(workflow.includes(text));
  assert(!/secrets\.|pull_request_target|contents: write|git push|gh pr merge/.test(workflow));
});
const dir = path.join(__dirname, '../automation/runs'); fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'bridge-tests.json'), JSON.stringify({ schema: 1, tests: results, agent_audit: 'NOT_REVIEWED', simulated_transport: false }, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2)); if (results.some(r => r.status === 'FAIL')) process.exitCode = 1;

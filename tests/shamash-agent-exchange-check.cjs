'use strict';
// SHAMASH: synthetic-only, dependency-free handoff contract check.
// Does NOT invoke Codex or Claude, access secrets, or approve any merge.
const assert = require('node:assert/strict');
const fs = require('node:fs');

function validateTask(task) {
  assert.equal(typeof task.task_id, 'string');
  assert.match(task.task_id, /^[A-Z0-9][A-Z0-9_-]{2,63}$/);
  assert.equal(task.test_data, 'synthetic');
  assert.equal(task.requires_owner_approval_for_merge, true);
  assert.ok(Array.isArray(task.allowed_files) && task.allowed_files.length > 0);
  assert.ok(task.allowed_files.every(p => typeof p === 'string' && p.length > 0 && !p.startsWith('/') && !p.includes('..')));
  assert.ok(!task.allowed_files.some(p => p === '.github/workflows/shamash-static-checks.yml'));
  assert.ok(Array.isArray(task.acceptance_checks) && task.acceptance_checks.length > 0);
}
function validateImplementation(report, task) {
  assert.equal(report.task_id, task.task_id);
  assert.match(report.commit_sha, /^[0-9a-f]{40}$/);
  assert.ok(Array.isArray(report.changed_files));
  assert.ok(report.changed_files.every(p => task.allowed_files.includes(p)));
  assert.ok(['READY_FOR_INDEPENDENT_REVIEW', 'BLOCKED'].includes(report.status));
  assert.ok(Array.isArray(report.tests));
}
function validateReview(review, report) {
  assert.equal(review.task_id, report.task_id);
  assert.equal(review.reviewed_commit_sha, report.commit_sha);
  assert.ok(['PASS', 'PASS_WITH_FINDINGS', 'FAIL', 'NOT_REVIEWED'].includes(review.verdict));
  assert.ok(Array.isArray(review.findings));
  assert.ok(Array.isArray(review.scope_violations));
}

const task = {
  task_id: 'DEMO-EXAMPLE-001',
  test_data: 'synthetic',
  allowed_files: ['docs/synthetic-demo-example.txt'],
  acceptance_checks: ['No real data and no main branch changes'],
  requires_owner_approval_for_merge: true
};
const report = {
  task_id: task.task_id,
  commit_sha: 'a'.repeat(40),
  changed_files: ['docs/synthetic-demo-example.txt'],
  tests: [{ name: 'synthetic', result: 'PASS', evidence_url: null }],
  status: 'READY_FOR_INDEPENDENT_REVIEW'
};
const review = {
  task_id: task.task_id,
  reviewed_commit_sha: report.commit_sha,
  verdict: 'NOT_REVIEWED',
  findings: [],
  scope_violations: []
};
validateTask(task);
validateImplementation(report, task);
validateReview(review, report);
assert.throws(() => validateTask({ ...task, test_data: 'real' }));
assert.throws(() => validateTask({ ...task, requires_owner_approval_for_merge: false }));
assert.throws(() => validateImplementation({ ...report, changed_files: ['app.js'] }, task));
assert.throws(() => validateReview({ ...review, reviewed_commit_sha: 'b'.repeat(40) }, report));
assert.ok(fs.existsSync('docs/SHAMASH-AGENT-EXCHANGE-01.md'));
console.log('PASS: synthetic task, implementation and independent-review exchange contract; negative cases rejected.');
console.log('NOT RUN: Codex, Claude, live integration, production and security acceptance.');

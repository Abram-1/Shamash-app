# SHAMASH AGENT EXCHANGE 01 — DOCUMENTARY CONTRACT

Status: DRAFT, SYNTHETIC ONLY, NOT AN ACTIVE AGENT CONNECTION.
Scope: isolated development/review branches; no main, deployment, production, secrets or paid API.

## Input to Codex (TASK)
```json
{
  "task_id": "DEMO-EXAMPLE-001",
  "source": "owner-approved scope reference",
  "branch": "isolated-task-branch",
  "allowed_files": ["path/to/explicitly-approved-file"],
  "forbidden": ["main", "deployment", "real data", "secrets", "payments"],
  "acceptance_checks": ["explicit observable criterion"],
  "test_data": "synthetic",
  "requires_owner_approval_for_merge": true
}
```
No task is executable without a specific approved scope and permitted files. Do not infer approval from this example.

## Codex output (IMPLEMENTATION REPORT)
```json
{
  "task_id": "DEMO-EXAMPLE-001",
  "commit_sha": "<exact commit SHA>",
  "changed_files": [],
  "tests": [{"name": "check name", "result": "PASS|FAIL|NOT_RUN", "evidence_url": null}],
  "limitations": [],
  "status": "READY_FOR_INDEPENDENT_REVIEW|BLOCKED"
}
```

## Claude input
Use the same TASK, exact immutable commit SHA, changed-file diff and independent GitHub CI evidence. Reviewer must not trust the implementer's summary as proof.

## Claude output (INDEPENDENT REVIEW)
```json
{
  "task_id": "DEMO-EXAMPLE-001",
  "reviewed_commit_sha": "<exact commit SHA>",
  "verdict": "PASS|PASS_WITH_FINDINGS|FAIL|NOT_REVIEWED",
  "findings": [{"severity": "BLOCKING|MAJOR|MINOR", "evidence": "file/line or reproducible test", "recommendation": ""}],
  "scope_violations": [],
  "limitations": []
}
```

## ChatGPT owner report
Report verified vs unverified separately. Cite commit SHA, CI run and review artifact. Any missing reviewer invocation must be stated as NOT_REVIEWED, never PASS. No automatic merge.

## Release gates
1. Verify Codex and Claude invocation methods and permissions (currently unverified).
2. Establish explicit data boundaries and costs (zero paid usage without separate approval).
3. Run a harmless synthetic end-to-end proof with no code deployment.
4. Owner reviews evidence before enabling unattended execution.

## Existing project restrictions
Gate A BLOCKED, CM33 HARD STOP, Agent D BLOCKED, BD-03 STOP. No real records, payments, IAM or production integration.

## GITHUB EXCHANGE 01 — local structural implementation addendum

Date: 2026-11-06 Asia/Jerusalem. Version: SHAMASH_AGENT_EXCHANGE_V1. Status: IMPLEMENTED / locally TESTED / DOCUMENTED; remote CI execution NOT VERIFIED; no real agent exchange or owner acceptance claimed.

Authority and scope: owner's GITHUB EXCHANGE 01 in current chat. Executor: Codex; acceptance authority: SHAMASH owner. File ownership for this work is limited to automation/exchange/*, tests/shamash-github-exchange-check.cjs, this append-only documentation update and two additive validation steps in the existing shamash-static-checks workflow. Existing bridges, earlier CONNECTION 01 files, application, financial module and historical proofs are not edited. Baseline branch automation/shamash-ci-setup-01, commit ab1ba30e2dbcfad1e8c201395bdfd02113f13a65. No commit/push/merge/deploy, secret or paid API.

### Reuse and formats

The documentary TASK / IMPLEMENTATION REPORT / INDEPENDENT REVIEW above remains historical. The new executable schema makes the same separation explicit without replacing existing bridge inputs or saved evidence:

- automation/exchange/schema.json: JSON Schema with task, implementation_result, independent_review and operational event definitions.
- automation/exchange/exchange.cjs: dependency-free structural/cross-reference checks, canonical SHA256, history replay, local publish and processing acknowledgements. No AI/network/Git commands.
- automation/exchange/fixtures.json: three synthetic records for existing DEMO-AUTOMATION-001 at the exact baseline SHA. A hypothetical Codex result and Claude BLOCKED review are marked SIMULATED_NOT_AN_AGENT_RUN; they do not replace actual earlier Codex proof or claim a new Claude audit.
- automation/exchange/history.jsonl: five synthetic operational events demonstrating registration and a delivery acknowledgement. It is a fixture, not a record of actual agent work.
- tests/shamash-github-exchange-check.cjs: local positive/negative persistence and structure tests. Only uniquely-created temporary test directories are removed; no historical run files are rewritten.

Common fields: protocol/schema_version, immutable record_id, task_id, exact commit_sha, producer and recipient (ID + role), status, SYNTHETIC classification and owner_decision=REQUIRED_NOT_GRANTED. Task payload declares allowed_actions/files, acceptance checks, reviewer and authorization reference. Implementation payload links the exact task record and lists changed files/tests/limitations. Independent review links the exact implementation, gives verdict/findings/limitations and explicitly states unverified independence for these fixtures.

Actors are data rather than hardcoded product names. Additional implementer/reviewer IDs pass the same formats and role/cross-reference checks. The local tests verify this. These formats carry assertions, not authenticated identities; naming an actor 'claude' does not prove execution or independent review. Actual execution provenance and transport authentication remain a separate gate, with no mock-to-real promotion implemented.

This milestone permits only the synthetic file namespace and READ_SYNTHETIC / WRITE_ALLOWED_FILES / RUN_SYNTHETIC_TESTS / REPORT. It defines no execution handlers. There is no action for owner approval, payment, legal decisions, deployment, merge or lifting STOP. New real workflows or broader scopes require separate owner authorization; an actor ID does not expand permissions.

### History and repeat protection

Records are immutable. Corrections require new record IDs and explicit links to the relevant task/result; never overwrite prior records. Event entries bind canonical record SHA256, task ID, commit SHA, assigned consumer, sequence and previous event hash. Replay checks additions and the transitions REGISTERED -> CLAIMED -> COMPLETED or BLOCKED. COMPLETED means consumption of an exchange record, not completion/acceptance of construction, approval of code, or an owner's decision. A task may still be PROPOSED while a synthetic delivery acknowledgement demonstrates the format.

Local publish(root, record) uses an exclusive lock and exclusive record-file creation. Re-registering identical content returns ALREADY_REGISTERED without appending history; changing content under an existing ID fails. acknowledge(root, id, consumer, state) persists a claim, rejects a wrong recipient and blocks another claim after CLAIMED/COMPLETED/BLOCKED. It does not execute the task. Interrupted locks, orphan record files or malformed/truncated history stop processing for explicit investigation; no automatic cleanup, retry or historical rewrite.

These checks serialize cooperating local writers using one persistent state root and detect duplicate/conflicting claims in one repository ledger. They are not distributed exactly-once execution, authenticated signatures or protection from a hostile local administrator rewriting the whole ledger. For a future GitHub consumer, the claim must be durably published with an expected-head lease and acknowledged before any side effect. That remote write/claim transport is not implemented or authorized here. Multiple clones must not treat unpublished local claims as global reservations.

The operational ledger is not a new Project Memory/master test register. It records exchange transactions only. Existing project history and master register remain authoritative and untouched. Work authority and this result are recorded in the current chat; existing issue and historical evidence are not rewritten.

### Validation and readiness

Commands, from this isolated copy:

```
node automation/exchange/exchange.cjs check
node tests/shamash-github-exchange-check.cjs
node tests/shamash-agent-exchange-check.cjs
```

The checker CLI is read-only and validates only the three fixture records and five history entries. Explicit local publish/acknowledge functions are exercised only in temporary synthetic stores by tests. The schema validator supports exactly the JSON Schema keyword subset used in schema.json and fails closed on unsupported schema keywords/types. JSON Schema plus referential/state checks form the validation contract; schema-only success is insufficient.

Local results: checker STRUCTURE_PASS_ONLY; 18 new test groups PASS, 0 FAIL; existing documentary exchange test PASS. Tests reject missing/extra authority fields, wrong SHA/references, scope violations, self-review, bad verdicts, history substitution/replay, changed record IDs, duplicate consumption, wrong recipients, stale locks and interrupted writes. No agent, account, external service or real construction/financial data is used.

Existing GitHub Actions steps and read-only permissions are retained. Two steps are added in static-contract for the checker and new local tests; neither invokes an AI. This work is not committed or pushed, so those new remote steps have not run. After separately authorized publication they will provide structure/test results for the triggering repository version; the fixture commit_sha deliberately remains the exact original artifact target, not a floating branch head or proof that new uncommitted code has a commit SHA.

PASS here means valid synthetic exchange structure and repeat/state protections in the local test scope. Independent Claude audit, actual agent invocation/provenance, GitHub write-lease handling, unattended consumers, remote CI for these changes and delivery to ChatGPT/owner remain NOT VERIFIED / not connected. Any technical validation result preserves owner_decision=REQUIRED_NOT_GRANTED; it never authorizes merge, deployment or other owner decisions.

Gate A BLOCKED; CM33 HARD STOP; Agent D BLOCKED; BD-03 STOP. All other SHAMASH restrictions remain. No publication follows automatically.

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

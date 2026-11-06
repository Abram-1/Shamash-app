# SHAMASH AGENT HANDOFF 01 — DESIGN ONLY

Status: DRAFT / NOT ACTIVE. Owner's request: reduce manual transfer between ChatGPT, Codex, Claude and GitHub. This document does not authorize agent execution, paid API calls, deployment, merge or removal of any STOP.

## Verified baseline
- Repository: Abram-1/Shamash-app.
- Isolated branch: automation/shamash-ci-setup-01.
- GitHub Actions workflow: .github/workflows/shamash-static-checks.yml.
- GitHub Actions run 42114053642 concluded success on 2026-11-05. Scope: structural smoke check only; not a production/security/finance acceptance test.
- Branding is a separate branch; do not merge it as part of agent setup.

## Intended handoff
1. ChatGPT creates a narrowly scoped, versioned task with allowed files, forbidden operations, expected test and owner approval boundary.
2. Codex implements on an isolated task branch and submits commit SHA, diff, test evidence and uncertainties. No automatic merge.
3. GitHub runs read-only checks and attaches run URLs.
4. Claude independently audits the exact commit SHA and task requirements; returns PASS / PASS WITH FINDINGS / FAIL, each with evidence and severity.
5. ChatGPT reconciles results and reports to owner. Owner separately authorizes any merge, release or permission expansion.

## Unresolved integration dependencies (must not pretend active)
- No callable Codex execution integration confirmed in this ChatGPT session.
- No callable Claude execution integration confirmed in this ChatGPT session.
- Determine supported secure invocation method for each (native connector, user-owned runner, or authorized API), identity, permissions, costs and data processing terms before implementation.
- Never commit credentials or use GitHub Actions secrets without separate owner-approved setup.
- Prefer no-cost, read-only, synthetic-data validation initially; any paid API calls need a separate budget and approval.

## Guardrails
- Gate A BLOCKED, CM33 HARD STOP, Agent D BLOCKED, BD-03 STOP remain in force.
- No real construction, personal, financial or legal records in tests.
- No production deployment, IAM/payment changes, publication, unattended merge or removal of history.
- No claim that an automated Codex → Claude pipeline is active until end-to-end execution is demonstrated with exact commit, test run and audit artifact.

## Next verifiable milestone
Document a zero-secrets proof of handoff format and independently check the existing workflow's actual steps. Propose (but do not activate) a minimal isolated integration only after the invocation methods are confirmed.

## AUTOMATION INTEGRATION 01 — implementation addendum, 2026-11-06

This append-only update supersedes only the earlier statements that no callable Codex integration is confirmed. Historical baseline and all gates remain.

Verified locally: Codex CLI 0.166.0-alpha.6, logged in using ChatGPT, real read-only ephemeral synthetic invocation. First restricted attempt failed during app-server initialization; one technical retry with normal host access succeeded. No API key created or transferred. Existing subscription quota is used; available remaining quota and any future overage costs are NOT VERIFIED.

Implementation: automation/bridge.cjs, owner-scoped task.json, exact output proof and event receipt, synthetic function, tests/shamash-automation-bridge-check.cjs, additions to the existing static-checks workflow. Command `node automation/bridge.cjs codex` makes at most one initial invocation; `retry-codex` allows only one explicit technical retry after a blocked attempt. There is no automatic correction execution in this milestone (zero <= maximum two). No generated code is run in the bridge; its output is tested separately in a bounded VM. Regex screening is defense in depth, not a general-purpose security sandbox.

Existing isolated branch is reused; no main work or arbitrary task ingestion. One local worker lock, one serialized GitHub workflow, no concurrent AI workers. The sole executable task is the synthetic sum fixture. Broader tasks require a separately approved scope and implementation.

GitHub automatically checks the exact commit, validates output against proof, emits a Claude request tied to GITHUB_SHA/run URL, and retains state, events, tests and the request as a 14-day artifact. Successful CI is PARTIAL_PASS only; Claude remains BLOCKED / NOT_REVIEWED. Job summary reports this explicitly. No Claude verdict is fabricated.

Recovery: inspect automation/runs/state.json and events.jsonl. Log files from the first technical attempt are retained with .attempt1 suffix. A stale worker.lock must be checked against its PID before removal; never delete an active lock. Do not automatically retry completed tasks or expand the retry limit. A failed receipt write leaves .tmp evidence and must be investigated. Code output uses exclusive file creation to prevent overwriting an existing result. A GitHub retry creates a new run-attempt artifact; it does not start an AI or new task.

Actual Claude bridge, bidirectional findings return, autonomous corrections and automatic delivery into a ChatGPT chat are NOT CONNECTED. Claude CLI is absent from PATH and checked standard Windows locations. No auth or budget is assumed. Owner's minimum next action is to provide an installed, authorized Claude Code execution route and clarify permitted subscription usage without paid API/new secrets. Then audit this exact candidate with the generated request, before enabling further workflow.

Official invocation references:
- https://developers.openai.com/codex/noninteractive (codex exec)
- https://code.claude.com/docs/en/headless (claude -p; bare mode requires API auth and is excluded here)
- https://docs.github.com/en/actions/tutorials/store-and-share-data (immutable workflow artifacts)

No overall PASS until real Codex -> GitHub -> Claude -> report evidence is available. Gate A BLOCKED; CM33 HARD STOP; Agent D BLOCKED; BD-03 STOP.

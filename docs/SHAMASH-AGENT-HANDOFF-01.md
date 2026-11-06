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

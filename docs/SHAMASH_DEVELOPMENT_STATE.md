# SHAMASH — DEVELOPMENT STATE — 2026-11-09

Status: checkpoint of confirmed discussion and Codex reports. This file does not authorize implementation or agent execution.

## Approved foundations
- Retain approved SHAMASH MASTER ARCHITECTURE and existing change-control process.
- Roles and workflow: ChatGPT → Codex → Claude independent review → ChatGPT → Owner. No new privileges.
- Gate A: BLOCKED; CM33: HARD STOP; Agent D: BLOCKED; BD-03: STOP.
- No real construction data, payments, paid API, expanded agent permissions, or unrestricted deployment.
- Maximum two independent workstreams; no simultaneous modification of shared files.

## CLAUDE-TEST-01 — CONDITIONAL APPROVAL, NOT EXECUTED
- Owner conditionally approved ONE synthetic Claude trial only after compatibility, licensing, and OS isolation are confirmed.
- Existing adapter: `shamash-automation-integration-01/automation/github-claude-local.cjs`. Commands include inspect-claude, prepare-local, prepare-gh, import-review. No real audit execution command.
- inspect-claude calls metadata flags only (`--version`, `--help`). Installed Claude Code reported as v2.1.317. Help lists `--bare`, `--tools`, `--strict-mcp-config`, `--permission-mode`; combined behavior NOT VERIFIED.
- Planned controls: one invocation, zero retries, shell=false, 60-second timeout, execution disabled until authorization. These are plan values, not proven runtime isolation.
- RUN-09: PREPARED_NOT_EXECUTED; independent_audit NOT_VERIFIED. Simulated/imported review does not constitute independent Claude audit.
- Previously tested: archive/manifest/hash integrity and conflicting import safeguards. Do not repeat without specific reason.
- Windows preflight showed adjacent file readable; AppContainer PREFLIGHT 02 did not establish a safe disposable profile. OS-level isolation NOT VERIFIED.
- Interactive directory trust request was declined. No Claude audit was launched.
- Subscription terms for intended automation, effective managed hooks, actual quota/cost controls and real execution remain NOT VERIFIED.

## Workstream A — FINANCE-DEMO-NEXT
- Continue standalone synthetic subcontractor finance demo, plaster quantities: performed 100 m² × 80 ILS = 8,000 ILS; accepted 80 m² × 80 ILS = 6,400 ILS; not accepted 20 m² × 80 ILS = 1,600 ILS.
- Previously agreed next step: editable performed and accepted quantities and unit rate; automatic recalculation; reject accepted > performed. Preserve existing scenarios.
- No real data, payment authorization, core changes or publication.

## Workstream B — ISOLATION-READINESS-01
- READ-ONLY comparison of previously approved isolated VM design, AppContainer PREFLIGHT 02 evidence, and existing adapter.
- Identify minimal OS-level isolation and synthetic-process proof before Claude invocation; clarify subscription/licensing questions.
- No VM installation, Windows modifications, Claude launch, publication, or security-gate changes.

## Continuation protocol
- Keep independent assignments and results for A and B.
- Codex may work only within separately authorized scope; Claude audits independently only when safety conditions are met.
- ChatGPT reviews results; owner retains final decision.
- Do not restart architecture or repeat confirmed tests without reason.
- This checkpoint contains no personal local paths, secrets or credentials.

## 2026-11-10 — Workstream A visual verification (reported and screenshot-observed)
- Codex reported 7 PASS / 0 FAIL for the synthetic finance demo using Node.js simulated DOM; no browser validation was completed by Codex at that time.
- Owner opened a local finance-demo correction-01 index.html in Chrome and provided screenshots.
- Initial visible values: performed 100 m² × 80 ILS = 8,000 ILS; accepted 80 m² × 80 ILS = 6,400 ILS; unaccepted 20 m² × 80 ILS = 1,600 ILS.
- Edited performed to 120 m²: displayed 9,600 / 6,400 / 3,200 ILS — visual PASS.
- Edited accepted to 100 m²: displayed 9,600 / 8,000 / 1,600 ILS — visual PASS.
- Edited synthetic rate to 90 ILS/m²: displayed 10,800 / 9,000 / 1,800 ILS — visual PASS.
- The unaccepted-volume warning updated on screenshots. The contract limit remained NOT VERIFIED; calculations do not authorize payment.
- Scope: only this synthetic scenario and observed interactions. No claim of full finance module acceptance, production readiness, or independent code audit. No program files modified by this documentation update.
- Workstream B unchanged: Claude trial NOT EXECUTED; OS isolation and licensing NOT VERIFIED; Gate A BLOCKED, CM33 HARD STOP, Agent D BLOCKED, BD-03 STOP.

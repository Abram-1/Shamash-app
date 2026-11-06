# AUTOMATION INTEGRATION 01 — technical result

Status before remote verification: PARTIAL PASS locally; overall end-to-end BLOCKED on Claude. Not owner accepted; no independent audit.

Owner-scoped source: automation/SCOPE.md and task.json; baseline 9102e066e30606c6fc07e6b24c9268e53a398ffe. Implementer: Codex. Data: entirely synthetic. Version: AUTOMATION_INTEGRATION_01.

Local evidence: automation/codex-proof.json + codex-events.jsonl. Real agent thread 01a1b0bb-03c4-7422-ba24-ec33dd609027. Codex CLI returned exit 0, generated only automation/synthetic/sum.cjs. Input usage 17425 tokens; output 123 tokens. This was a ChatGPT-authenticated invocation, not a paid API connection. No remaining-quota or price claim.

Executed locally: existing tests/shamash-agent-exchange-check.cjs PASS; new tests/shamash-automation-bridge-check.cjs, five groups PASS including negative cases and safe integer boundaries; git diff --check PASS. No production or browser tests. Mock/in-memory tests prove contracts only; real agent invocation evidence is separate.

Remote CI evidence is available at the pushed exact commit and matching Actions run. The workflow emits automation/runs/claude-request.json and state.json and uploads the evidence artifact; it does not invoke Claude. Check the final chat report for the verified commit and run URL (not a guessed or historical run).

Files changed/added: .github/workflows/shamash-static-checks.yml (existing workflow extended); docs/SHAMASH-AGENT-HANDOFF-01.md (append-only); .gitignore; automation/{SCOPE.md,task.json,bridge.cjs,codex-proof.json,codex-events.jsonl,synthetic/sum.cjs}; tests/shamash-automation-bridge-check.cjs; this document. Existing app entrypoints and finance copy untouched. Local runtime journals under automation/runs are ignored and are not committed.

Limitations: GitHub artifact retention 14 days; local logs retained separately. Logs are not a tamper-proof independent audit. CLI subprocess timeout 45 seconds. One initial attempt plus one explicit technical retry; automatic correction attempts zero. No generalized untrusted task runner. Task branch reuse is intentional; isolated approved automation branch is not main.

NOT VERIFIED: Claude execution/auth/costs, actual independent verdict, findings return, unattended task scheduling, ChatGPT automatic report delivery, production security, legal sufficiency, integration readiness. No secrets, new account permissions, deployments, merges or paid APIs configured. Protected stops remain.

Existing project history/master register is not modified outside task scope. This report is scoped evidence for later registration, not a replacement register.

### CI finding and correction
First remote run https://github.com/Abram-1/Shamash-app/actions/runs/42214928025 at 0e2b2cc65249f3a7690f141e9418c8bc6896563f: existing smoke and five bridge test groups PASS; evidence handoff FAIL with BRANCH_SCOPE_REJECTED. Root cause: exact-SHA actions/checkout correctly creates a detached HEAD, while the pilot incorrectly required a named local branch. Failure logs and first artifact are retained. Correction: CI validates repository + allowed GITHUB_REF + full GITHUB_SHA matching HEAD; local agent commands still require the named isolated branch. Added a regression test accepting detached exact-SHA checkout and rejecting main/wrong SHA. No guard was removed or scope expanded. Final bridge suite now has six groups.

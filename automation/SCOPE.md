# SHAMASH AUTOMATION INTEGRATION 01 — execution scope

Date: 2026-11-06 Asia/Jerusalem. Executor: Codex. Acceptance: owner; Claude independent review required.
Authorization: owner attachment AUTOMATION INTEGRATION 01 in current chat.
Baseline: Abram-1/Shamash-app, automation/shamash-ci-setup-01 at 9102e066e30606c6fc07e6b24c9268e53a398ffe.
Owned scope: isolated automation branch; existing .github/workflows/shamash-static-checks.yml, docs/SHAMASH-AGENT-HANDOFF-01.md and tests/shamash-agent-exchange-check.cjs reused. Add only automation/, automation tests, docs automation evidence, and local ignore entries. Existing app/finance modules excluded.
Interfaces: existing TASK/IMPLEMENTATION/REVIEW contracts; Node built-ins, Git CLI, supported codex exec and optional Claude CLI. No third-party runtime dependencies. Current existing handoff document remains historical; changes will be additive.
Security: synthetic task only; no main modifications, merge, deployment, IAM, real data, secrets or paid APIs. At most one local worker; concurrency lock; maximum two correction attempts (no automatic corrections enabled in this milestone). No model-generated shell execution. No new credentials. Persistent state/logs are local ignored files; sanitized proof may be committed.
Acceptance: real Codex CLI execution + exact code/version evidence, GitHub run on exact SHA, real Claude audit required for overall PASS. Static tests/mock transports cannot establish agent connection. Partial stages and blocked causes retained explicitly.
Version/provenance: this file plus task.json, implementation proof, Git commit SHA and Actions receipts/artifacts. Current chat records owner's authority. Existing project master register outside clone remains untouched; no competing Project Memory created.
Gate A BLOCKED; CM33 HARD STOP; Agent D BLOCKED; BD-03 STOP remain.

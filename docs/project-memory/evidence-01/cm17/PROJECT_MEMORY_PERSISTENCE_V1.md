# PROJECT_MEMORY_PERSISTENCE_V1
Journal retains typed source refs, immutable reference revisions, captured decisions/work verification/material/financial/schedule/forecast evidence, actor/time, audit/receipts and correlation IDs. Captured evidence bytes are content-addressed, deduplicated, hashed and included in backup. Projection is rebuilt from journal; it cannot become a separate authority.

Correction is a new entity version/event, never update/delete old event. Current materialized reference state does not erase historical versions. Read/status do not append audit/event/receipt. AI assumptions/estimates/claims stay explicitly classified; no automatic VERIFIED physical fact. Existing Project Memory and source contracts unchanged, no legacy migration or automatic live import.

Durable CM17 reference history/source snapshots tested on local filesystem/restart; full persistence of each old module's mutable business state/native authority is not claimed. This is not production Project Memory or an implementation of FULL_TASK/acceptance/payment. Source capture date vs local registration time vs synthetic observation date remain distinct.

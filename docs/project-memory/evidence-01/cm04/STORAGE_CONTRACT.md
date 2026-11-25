# CM04 — SYNTHETIC STORAGE CONTRACT
Не новый production API и не изменение старых TASK/SCOPE/Project Memory DTO.

## Граница
Один journal instance строго привязан к company/project/building/floor/locationType/locationId. Идентификаторы не нормализуются; порядок полей не является identity. Между scope нельзя читать даже checkpoint/count.
Factory требует boundScope, identity callback и authorize callback; отсутствие — AUTHORITY_REQUIRED. READ и WRITE независимы; deny-default при отсутствии разрешения.
UI factory — явный RAM_FIXTURE_OBSERVER, owner-authorized demo recording; не реальный UID/grants.
Node — SYNTHETIC_SERVER_MODEL fixture identity. Клиентские поля не задают identity.

## Request — ровно5 полей
contractVersion = CM04_FIXTURE_CAPTURE_V1;
operationId ASCII [A-Za-z0-9_-]{1,80};
recordId — ID источника в server-model/fixture-owned registry;
expectedVersion integer >=0, current stream version;
scope — ровно6 полей выше.
UID/author/role/grants/engineer/permission в request запрещены. Источник и event берутся resolver из fixture registry, не из request payload.

## Bundle
CM04_BUNDLE_V1: format,sequence,previousHash,event,audit,receipt,hash.
Canonical JSON + LF; SHA-256 digest включает весь bundle кроме hash. Sequence contiguous; previousHash exact.
PROJECT_MEMORY_EVENT: type,id,scope,streamId,version,previousEventId,sourceRecord,sourceEvent,classification,verificationBoundary,references,recordedAt.
EVENT_VERSION — immutable streamId/version/previousEventId внутри event, отдельно от исходной document/item version; не mutable overwriting.
DOCUMENT_VERSION_REFERENCE/WORK_ITEM_REFERENCE/CONTRACTOR_REFERENCE/QUANTITY_CHECK_REFERENCE/FINANCIAL_REVIEW_REFERENCE: type,id,version,scope. Здесь version — версия immutable source record. Quantity itemVersion и financial itemRef.version проверяются отдельно, не подменяются sourceRecord.version.
AUDIT_RECORD: type,id,eventId,operationId,scope,actorUid,identityMode,recordedAt,effect=FIXTURE_RECORDING_ONLY.
OPERATION_RECEIPT: type,id,operationId,requestHash,scope,actorUid,eventId,version,recordedAt,effect=NO_BUSINESS_AUTHORIZATION.
RECOVERY_CHECKPOINT: type,format,scope,sequence,lastHash,createdAt,actorUid,hash.

## Источники/связи
Capture обязан разрешить sourceRecord и sourceEvent в одном exact scope; sourceEvent recordId/version/author/source должны совпасть.
Все links должны указывать на ранее записанные immutable objects того же scope. Exact document versions и typed contract/work links проверяются.
Quantity changes требуют последовательного itemVersion; financial references должны соответствовать captured quantity version.
sourceRecord/sourceEvent сохраняются целиком, с provenance/history, без превращения локального source author в verified UID.
Classifications CLAIM / VERIFIED FACT / AI SUGGESTION; verificationBoundary всегда SYNTHETIC_ONLY_NOT_LEGAL. VERIFIED FACT здесь не реальный инженерный факт.

## Commit/replay
Один physical append содержит event+audit+receipt; отдельно эти элементы не пишутся.
До append: request/identity/authorization, whole log integrity, receipt lookup, duplicate source, CAS, references, candidate scan, повторный synthetic WRITE/UID gate.
Replay проверяет текущий gate и exact request hash, возвращает исходный receipt; не новая проверка инженерного основания. Иной payload — OPERATION_CONFLICT.
same source с новым operationId — DUPLICATE_SOURCE. Error не создаёт автоматический permanent error log.
Производитель CM03 RAM и file journal не одна distributed transaction. При failure journal UI явно ERROR/NOT SAVED; source RAM может уже существовать. Recovery не запускает producer вновь.

## Лимиты
Bundle <=262144 UTF-8 bytes; whole log <=16MiB; <=5000 bundles; references <=100; JSON depth <=32. Cycles/undefined/nonfinite/unsupported types/lone surrogates fail-closed. Никакого silent trimming.
File adapter только fixtures/ под CM04, exact ownership runId; writer.lock exclusive, адресное удаление только собственного lock token при close. Полный server/OS security boundary не заявлен.

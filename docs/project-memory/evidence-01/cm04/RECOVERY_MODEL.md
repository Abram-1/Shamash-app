# CM04 — checkpoint/replay и предел доказательства
## Фактически выполнено
Node file adapter пишет canonical append-only bundles и fsync. Тест C18 закрыл собственный adapter, запустил новый Node процесс, открыл тот же owned fixture, проверил checkpoint и сравнил read-only projection/hash/sequence с исходными.
C19: complete append + injected unknown result; после close/reopen exact original operation вернула прежний receipt без нового event.
C20: partial line сохранена как evidence; read/recovery ERROR, никаких trim/repair.
C38: malformed UTF-8 не декодируется с replacement; байты сохранены.
Checkpoint и REOPEN_EVIDENCE лежат только в owned fixtures.

## Алгоритм
1. Identity/read gate и exact journal scope.
2. Строгий UTF-8 (file adapter), canonical JSON каждой полной LF строки; size/depth limits.
3. Contiguous global sequence/hash chain; event/audit/receipt agreement; stream version/source version/typed refs.
4. Проверка checkpoint hash/scope/sequence/lastHash.
5. Если log короче anchor или digest в точке anchor не совпадает — CHECKPOINT_MISMATCH.
6. Replay immutable records в read-only projection документов, договоров, WBS/quantity и financial consideration. Повторные commands/writes/платежи не выполняются.

RECOVERED_SYNTHETIC_LOG означает только восстановление проверенного журнала в этой модели.
historyCompleteness=VERIFIED_THROUGH_CHECKPOINT_ONLY.
postCheckpointCompleteness=NOT_PROVEN_WITHOUT_NEWER_ANCHOR.
businessStateRestored=false: старый mutable CM03 writer не импортируется/не запускается автоматически.

## Ошибки
CORRUPT_LOG/HASH/CHAIN/BUNDLE/RECORD, REFERENCE_INVALID, QUANTITY_VERSION_INVALID, INCOMPLETE_LOG, CHECKPOINT_INVALID/MISMATCH — явный отказ.
Нет молчаливого удаления повреждённой строки, сброса на пустую историю или localStorage fallback.
При неизвестном результате используется прежний operationId/request. При полном сохранённом bundle — receipt replay. При partial/corrupt log — ERROR и решение владельца о дальнейшей recovery процедуре, не автоматическое исправление.

## Что не доказано
Complete tail truncation без независимого актуального checkpoint не обнаружима достоверно. read сообщает NOT_PROVEN_WITHOUT_CHECKPOINT.
После более старого anchor исчезновение полного позднего suffix не может быть доказано без нового внешнего anchor. Нельзя утверждать полноту всей истории.
Unkeyed SHA-256/локальный checkpoint не защищают от злоумышленника, согласованно переписавшего весь журнал и anchors; подпись/внешний trusted anchor отсутствуют.
Physical power-loss, disk firmware/Windows crash behavior, multi-host transactions/Firestore, cloud backups, portable run-bound trust, настоящий browser F5 recovery — NOT PROVEN / NOT RUN.
Файловый lock подтверждён только для cooperating fixture adapters; это не защита от host administrator.

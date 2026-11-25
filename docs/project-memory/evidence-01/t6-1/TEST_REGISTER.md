# Project Memory · Test Register

T6-1: отдельный локальный сценарий этой копии, см. SCENARIOS.md. Статус исполнения **NOT RUN**; независимая проверка Claude **PENDING**. M06 дополнен отрицательными ветками, число модельных тестов осталось 9.

Все кейсы **NOT RUN**. Отдельное заключение Claude и решение владельца ещё не получены. Шаблон полей доказательств применяется после разрешённого запуска. Точные SHA файлов указаны в SHA256SUMS.

| ID | Проверка или сценарий | Вход и ожидание | Исполнитель | Факт / статус | Доказательство / дата | Проверяющий / статус |
|---|---|---|---|---|---|---|
| M01 | hierarchy distinguishes identical apartment labels and preserves project and building rows | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M02 | retains all original versions, variants and explicit same-scope endpoints | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M03 | retains valid ancestor link and rejects a cross-project destination | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M04 | apartment list and common context have no overlaps | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M05 | rejects inconsistent act delta, gross/retention and acceptance version | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M06 | approved unique successor archives competing versions without losing originals | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M07 | archives superseded acceptance and blocks live confirmation when a version conflicts | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M08 | quarantines corrupted, duplicate and foreign rows without changing healthy source data | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| M09 | fresh reconstruction retains IDs and existing catalog can search the projected row | Ассерты history-model.test.cjs | Codex | — / NOT RUN | — | Claude / PENDING |
| 01 | SCENARIOS.md | В двух компаниях открыть Ha-Dror 12 / Этаж 1 / Квартира № 5. Одинаковые подписи, разные полные ID. Штукатурка и её акт не появляются в «Горизонте». | Codex | — / NOT RUN | — | Claude / PENDING |
| 02 | SCENARIOS.md | В «Северном квартале» переключить Ha-Dror 12 на Ha-Dror 14. Список нового здания не содержит работы другого здания. Проектная история охватывает оба. | Codex | — / NOT RUN | — | Claude / PENDING |
| 03 | SCENARIOS.md | В Ha-Dror 12 / Этаж 1 переключить квартиру № 5 на № 6. Остаются только данные № 6, в частности «Монтаж перегородок». | Codex | — / NOT RUN | — | Claude / PENDING |
| 04 | SCENARIOS.md | Открыть Ha-Dror 12 без выбора этажа или квартиры, затем выбрать квартиру № 5. Осмотр проходов виден в здании, а в квартире показан в отдельном блоке наследуемых событий, без дублей в собственных событиях. | Codex | — / NOT RUN | — | Claude / PENDING |
| 05 | SCENARIOS.md | Открыть замену бригады и обе ссылки договора. Бригада A остаётся исполнителем штукатурки, B отвечает за отдельную доработку. | Codex | — / NOT RUN | — | Claude / PENDING |
| 06 | SCENARIOS.md | SYN-PARTIAL: v2 действует, 75/20/5 м²; v1 архивная, 80/15/5 м². Только v2 даёт действующее подтверждение работы. | Codex | — / NOT RUN | — | Claude / PENDING |
| F5-1 | SCENARIOS.md | v1 → конфликт v2 → однозначная v3 с явным утверждением. Проверить также отсутствующее и неполное утверждение и конфликт v3. | Codex | — / NOT RUN | — | Claude / PENDING |
| 07 | SCENARIOS.md | Отфильтровать материалы, открыть недостачу. 100 кг заказано, 90 получено, 10 недостача, 60 использовано, 5 возвращено, 2 повреждено показаны как разные операции. Недостача связана с получением. | Codex | — / NOT RUN | — | Claude / PENDING |
| 08 | SCENARIOS.md | Открыть «Отклонение плоскости · исправлено». Видны исходное замечание, v2, оставшиеся 5 м² и связанная карточка фото. | Codex | — / NOT RUN | — | Claude / PENDING |
| 09 | SCENARIOS.md | Открыть новую редакцию схемы. Видны допуск 10 мм, архивное значение 12 мм и отдельное изменение проекта. Два конфликтующих варианта другого документа сохраняются. | Codex | — / NOT RUN | — | Claude / PENDING |
| 10 | SCENARIOS.md | Открыть финансовую корректировку. Тот же акт v2, 75 м², удержание 300 ₪, дельта −380 ₪, расчёт 5 700 ₪. v1 доступна без пересчёта. | Codex | — / NOT RUN | — | Claude / PENDING |
| 11 | SCENARIOS.md | Открыть поручение v2 и перейти по связям. Ответственный S‑1 вместо S‑2, срок 12.11.2026 сохранён; видны решение, подтверждение исполнения и фото как метаданные. | Codex | — / NOT RUN | — | Claude / PENDING |
| 12 | SCENARIOS.md | Искать «Недостача», затем выбрать тип «Фото». Сначала совпадение CM09; при несовместимом фильтре пустой результат. | Codex | — / NOT RUN | — | Claude / PENDING |
| 13 | SCENARIOS.md | В модельной проверке подать дату 31.02.2026, чужую область, дубликат ID и поле payment в финансовом снимке. Четыре диагностированные записи не попадают в историю. Здоровые исходники не меняются. | Codex | — / NOT RUN | — | Claude / PENDING |
| 14 | SCENARIOS.md | Восстановить представление из той же фикстуры. Те же ID, прежние версии и суммы. Этот сценарий не обещает восстановление внешнего хранилища. | Codex | — / NOT RUN | — | Claude / PENDING |
| 15 | SCENARIOS.md | Перейти от поручения к решению, затем проверить отсутствующую независимую проверку старого заявления и конфликт версии схемы. Связи ограничены полными областями; отсутствующий источник и неоднозначная версия не считаются подтверждёнными. | Codex | — / NOT RUN | — | Claude / PENDING |
| PM-1 | SCENARIOS.md | Квартира № 5 в Ha-Dror 12, затем № 6 и такое же здание другой компании. Свои записи в первой ленте, семь общих для исходной ветви во второй, каждый ID один раз. У другой компании общие события исходной ветви отсутствуют. | Codex | — / NOT RUN | — | Claude / PENDING |
| PM-2 | SCENARIOS.md | Перейти от штукатурки к осмотру проходов, затем к проектному обследованию. В модельной проверке заменить конечную область на SYN-C1/SYN-P2. Исходные межуровневые переходы подтверждены отдельными свидетельствами; подмена области диагностируется и не даёт ссылки. Соседняя квартира не становится доступной через общую карточку. | Codex | — / NOT RUN | — | Claude / PENDING |
| PM-3 | SCENARIOS.md | Проверить v1/v2 финансовой ссылки, затем отдельно подменить удержание, дельту и версию приёмки у v2. Исходная v2 показывает −380 ₪, 5 700 ₪ и точный ID приёмки v2. При каждой подмене v2 исключается, v1 доступна, ошибка видна. | Codex | — / NOT RUN | — | Claude / PENDING |
| PM-4 | SCENARIOS.md | Открыть SYN-PLAN-REV и SYN-DRAWING. В первом случае v2 действующая, v1 архивная. Во втором оба варианта v2 конфликтуют и нет действующей версии, v1 остаётся архивной. | Codex | — / NOT RUN | — | Claude / PENDING |
| C4-1 | SCENARIOS.md | Открыть работу SYN-PLASTER, приёмку SYN-PARTIAL v1/v2, поручение SYN-ASSIGN-INSPECT и финансовую ссылку SYN-FIN-PL. В отдельной модельной фикстуре добавить второй вариант приёмки v2. Приёмка v1 (80 м²) архивная; подтверждение работы относится только к действующей v2 (75 м²). Исходные версии и ссылки доступны. При конфликте v2 подтверждение недоступно. Поручение и финансовая ссылка тоже имеют общий статус версии. | Codex | — / NOT RUN | — | Claude / PENDING |
| C4-2 | SCENARIOS.md | В SYN-C1/SYN-P1/SYN-B12/SYN-F1 открыть A05, затем A06. Перейти на F2/A05, затем в другое здание, другой проект и компанию SYN-C2. У обеих квартир F1 виден общий осмотр холла, у F2 его нет. Правило компании остаётся на стороне SYN-C1; проектные и домовые события появляются только на соответствующей ветви. Собственные и унаследованные ID не пересекаются. | Codex | — / NOT RUN | — | Claude / PENDING |
| T6-1 | SCENARIOS.md · M06 | Проверенная v3 открывает точное решение, обе v2 архивны. Некорректное утверждение диагностируется. Изолированная проверка самоутверждения использует бесконфликтную цепочку. | Codex | — / NOT RUN | — | Claude / PENDING |
| A-2 | SCENARIOS.md · M06 | Решение без валидной даты или датированное раньше версии не даёт утверждения. Совпадающая дата допустима. | Codex | — / NOT RUN | — | Claude / PENDING |
| A-3 | SCENARIOS.md · M06 | Из двух доказательств с одинаковыми концами подтверждается только связь с точным evidenceId утверждения. | Codex | — / NOT RUN | — | Claude / PENDING |

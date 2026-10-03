/* =========================================================
   SHAMASH CORE
   Construction Management Orchestrator
   Core Architecture v0.1
   ========================================================= */

/*
  ВАЖНО:
  SHAMASH CORE — центральное ядро системы.

  Принципы:
  1. AI не превращает предположение в факт.
  2. AI не получает больше прав, чем предоставлено пользователю.
  3. Все важные действия имеют источник и историю.
  4. Project Memory — структурированная память проекта.
  5. Старые версии важных данных не уничтожаются бесследно.
  6. Модули подключаются к CORE, а не существуют как несвязанные данные.
*/

const SHAMASH_CORE_VERSION = "0.1.0";

const SHAMASH_ARCHITECTURE_STATUS = {
  APPROVED: "УТВЕРЖДЕНО",
  DEVELOPMENT: "В РАЗРАБОТКЕ",
  PLANNED: "ПРЕДСТОИТ"
};

const SHAMASH_FACT_STATUS = {
  FACT: "FACT",
  CLAIM: "CLAIM",
  ASSUMPTION: "ASSUMPTION",
  AI_SUGGESTION: "AI_SUGGESTION",
  NEEDS_CONFIRMATION: "NEEDS_CONFIRMATION"
};

const SHAMASH_SOURCE_TYPES = {
  USER: "USER",
  DOCUMENT: "DOCUMENT",
  DRAWING: "DRAWING",
  PHOTO: "PHOTO",
  EMAIL: "EMAIL",
  WHATSAPP: "WHATSAPP",
  VOICE: "VOICE",
  INSPECTION: "INSPECTION",
  EXTERNAL_SOURCE: "EXTERNAL_SOURCE",
  SYSTEM: "SYSTEM",
  AI: "AI"
};

const SHAMASH_CORE = {

  meta: {
    product: "SHAMASH — Управление строительством",
    component: "SHAMASH CORE",
    version: SHAMASH_CORE_VERSION,
    architectureStatus: SHAMASH_ARCHITECTURE_STATUS.DEVELOPMENT
  },

  /*
    COMPANY / PROJECT LAYER
    SHAMASH должен поддерживать несколько компаний
    и несколько строительных объектов.
  */
  companies: [],
  projects: [],

  /*
    USERS & PERMISSIONS
    AI также обязан работать в рамках этих разрешений.
  */
  users: [],
  roles: [],
  permissions: [],

  /*
    PROJECT MEMORY
    Не архив, а связанная структурированная память проекта.
  */
  projectMemory: [],

  /*
    История решений.
    Решение может происходить из документа, разговора,
    WhatsApp, email, голосового сообщения и других источников.
  */
  decisions: [],

  /*
    Центральные строительные сущности.
  */
  tasks: [],
  schedule: [],
  workItems: [],
  materials: [],
  contractors: [],
  documents: [],
  drawings: [],
  inspections: [],
  defects: [],
  risks: [],
  costs: [],
  payments: [],

  /*
    PRICE MEMORY
    История расценок и происхождение каждой цены.
  */
  priceMemory: [],

  /*
    EXTERNAL SOURCE ACCESS MANAGER
    Контролирует право читать, сохранять,
    обновлять и использовать внешний источник.
  */
  externalSources: [],

  /*
    EVENT / AUDIT HISTORY
    История действий системы.
  */
  events: [],
  auditLog: []
};


/* =========================================================
   UNIVERSAL CORE RECORD
   ========================================================= */

function shamashCreateRecord({
  projectId = null,
  type,
  title,
  data = {},
  sourceType = SHAMASH_SOURCE_TYPES.USER,
  sourceReference = null,
  factStatus = SHAMASH_FACT_STATUS.NEEDS_CONFIRMATION,
  createdBy = null
}) {

  return {
    id:
      "sh_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8),

    projectId,
    type,
    title,
    data,

    provenance: {
      sourceType,
      sourceReference
    },

    factStatus,

    createdBy,
    createdAt: new Date().toISOString(),

    updatedAt: null,
    version: 1,

    history: []
  };
}


/* =========================================================
   PROJECT MEMORY
   ========================================================= */

function shamashAddToProjectMemory(record) {

  if (!record || !record.type || !record.title) {
    throw new Error(
      "SHAMASH CORE: запись памяти должна иметь type и title."
    );
  }

  SHAMASH_CORE.projectMemory.push(record);

  shamashAudit(
    "PROJECT_MEMORY_ADD",
    record.id,
    record.createdBy
  );

  return record;
}


/* =========================================================
   AUDIT LOG
   ========================================================= */

function shamashAudit(action, entityId, userId, details = {}) {

  const auditRecord = {
    id:
      "audit_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 7),

    action,
    entityId: entityId || null,
    userId: userId || null,
    details,
    timestamp: new Date().toISOString()
  };

  SHAMASH_CORE.auditLog.push(auditRecord);

  return auditRecord;
}


/* =========================================================
   HUMAN CONFIRMATION
   ========================================================= */

function shamashConfirmFact(record, userId) {

  if (!record) {
    throw new Error("SHAMASH CORE: запись не найдена.");
  }

  record.history.push({
    version: record.version,
    factStatus: record.factStatus,
    updatedAt: record.updatedAt
  });

  record.version += 1;
  record.factStatus = SHAMASH_FACT_STATUS.FACT;
  record.updatedAt = new Date().toISOString();

  shamashAudit(
    "FACT_CONFIRMED",
    record.id,
    userId
  );

  return record;
}


/* =========================================================
   CORE INITIALIZATION
   ========================================================= */

function shamashCoreInit() {

  console.log(
    "SHAMASH CORE initialized — version " +
    SHAMASH_CORE_VERSION
  );

  return SHAMASH_CORE;
}

window.SHAMASH_CORE = SHAMASH_CORE;
window.shamashCoreInit = shamashCoreInit;
window.shamashCreateRecord = shamashCreateRecord;
window.shamashAddToProjectMemory = shamashAddToProjectMemory;
window.shamashConfirmFact = shamashConfirmFact;

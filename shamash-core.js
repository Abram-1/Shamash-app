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
  buildings: [],

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
window.shamashConfirmFact = shamashConfirmFact;/* =========================================================
   PROJECT MEMORY — LOCAL STORAGE
   Сохранение памяти проекта в браузере
   ========================================================= */

const SHAMASH_CORE_STORAGE_KEY = "shamash-core-v01";

function shamashCoreSave() {
  try {
    localStorage.setItem(
      SHAMASH_CORE_STORAGE_KEY,
      JSON.stringify(SHAMASH_CORE)
    );
    return true;
  } catch (error) {
    console.error("SHAMASH CORE: ошибка сохранения", error);
    return false;
  }
}

function shamashCoreLoad() {
  try {
    const saved = localStorage.getItem(SHAMASH_CORE_STORAGE_KEY);

    if (!saved) {
      return SHAMASH_CORE;
    }

    const data = JSON.parse(saved);

    Object.keys(SHAMASH_CORE).forEach(function (key) {
      if (data[key] !== undefined) {
        SHAMASH_CORE[key] = data[key];
      }
    });

    return SHAMASH_CORE;
  } catch (error) {
    console.error("SHAMASH CORE: ошибка загрузки", error);
    return SHAMASH_CORE;
  }
}

window.shamashCoreSave = shamashCoreSave;
window.shamashCoreLoad = shamashCoreLoad;

shamashCoreLoad();
/* =========================================================
   PROJECT REGISTRY
   Связь строительных объектов с SHAMASH CORE
   ========================================================= */

function shamashRegisterProject(project) {

  if (!project || !project.id || !project.name) {
    throw new Error(
      "SHAMASH CORE: проект должен иметь id и name."
    );
  }

  const existingProject = SHAMASH_CORE.projects.find(
    function (item) {
      return item.id === project.id;
    }
  );

  if (existingProject) {
    return existingProject;
  }

  const coreProject = {
    id: project.id,
    name: project.name,
    location: project.location || "",
    status: project.status || "active",
    createdAt: new Date().toISOString()
  };

  SHAMASH_CORE.projects.push(coreProject);

  shamashAudit(
    "PROJECT_REGISTERED",
    coreProject.id,
    null
  );

  shamashCoreSave();

  return coreProject;
}

window.shamashRegisterProject = shamashRegisterProject;
/* =========================================================
   BUILDING REGISTRY
   Здания внутри строительного проекта
   ========================================================= */

function shamashRegisterBuilding(building) {

  if (!building || !building.id || !building.projectId || !building.name) {
    throw new Error(
      "SHAMASH CORE: здание должно иметь id, projectId и name."
    );
  }

  const existingBuilding = SHAMASH_CORE.buildings.find(
    function (item) {
      return item.id === building.id;
    }
  );

  if (existingBuilding) {
    return existingBuilding;
  }

  const coreBuilding = {
    id: building.id,
    projectId: building.projectId,
    name: building.name,
    status: building.status || "active",
    createdAt: new Date().toISOString()
  };

  SHAMASH_CORE.buildings.push(coreBuilding);

  shamashAudit(
    "BUILDING_REGISTERED",
    coreBuilding.id,
    null,
    {
      projectId: coreBuilding.projectId
    }
  );

  shamashCoreSave();

  return coreBuilding;
}

window.shamashRegisterBuilding = shamashRegisterBuilding;
/* =========================================================
   PROJECT SCHEDULE
   Календарное планирование проекта
   ========================================================= */

function shamashAddScheduleItem(item) {

  if (!item || !item.id || !item.projectId || !item.title) {
    throw new Error(
      "SHAMASH CORE: работа календарного плана должна иметь id, projectId и title."
    );
  }

  const existingItem = SHAMASH_CORE.schedule.find(
    function (scheduleItem) {
      return scheduleItem.id === item.id;
    }
  );

  if (existingItem) {
    return existingItem;
  }

  const coreScheduleItem = {
    id: item.id,
    projectId: item.projectId,
    wbs: item.wbs || "",
    title: item.title,
    start: item.start || null,
    end: item.end || null,
    owner: item.owner || "",
    dependency: item.dependency || "",
    progress: Number(item.progress) || 0,
    status: item.status || "planned",
    createdAt: new Date().toISOString(),
    updatedAt: null,
    version: 1,
    history: []
  };

  SHAMASH_CORE.schedule.push(coreScheduleItem);

  shamashAudit(
    "SCHEDULE_ITEM_ADDED",
    coreScheduleItem.id,
    null,
    {
      projectId: coreScheduleItem.projectId,
      wbs: coreScheduleItem.wbs
    }
  );

  shamashCoreSave();

  return coreScheduleItem;
}

window.shamashAddScheduleItem = shamashAddScheduleItem;
/* =========================================================
   PROJECT TASKS
   Работы и задачи проекта
   ========================================================= */

function shamashAddTask(task) {

  if (!task || !task.id || !task.projectId || !task.title) {
    throw new Error(
      "SHAMASH CORE: задача должна иметь id, projectId и title."
    );
  }

  const existingTask = SHAMASH_CORE.tasks.find(
    function (item) {
      return item.id === task.id;
    }
  );

  if (existingTask) {
    return existingTask;
  }

  const coreTask = {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    owner: task.owner || "",
    status: task.status || "planned",
    scheduleItemId: task.scheduleItemId || null,
    progress: Number(task.progress) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: null,
    version: 1,
    history: []
  };

  SHAMASH_CORE.tasks.push(coreTask);

  shamashAudit(
    "TASK_ADDED",
    coreTask.id,
    null,
    {
      projectId: coreTask.projectId,
      scheduleItemId: coreTask.scheduleItemId
    }
  );

  shamashCoreSave();

  return coreTask;
}

window.shamashAddTask = shamashAddTask;

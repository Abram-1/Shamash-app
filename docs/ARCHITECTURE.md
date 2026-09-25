# SHAMASH — Construction Management Orchestrator

## Product identity
**SHAMASH — Construction Management Orchestrator**
Русское рабочее название: **SHAMASH — строительный оркестратор управления проектами**.

## Core principle
SHAMASH is not just a collection of screens. The central system is **Project Memory / Память проекта**. Every important fact should be stored once and linked to the project, object, work package, person, document, material, money event, quality event, safety event, or decision it concerns.

## Orchestrator flow
User input -> SHAMASH Orchestrator -> Project Memory -> choose module/agent/tool -> analysis -> proposed action -> human decision -> result -> Project Memory.

SHAMASH may recommend, calculate, compare, warn, and prepare actions. Human approval remains the control point for consequential decisions.

## First modules
1. Project Memory
2. Calendar / WBS / Gantt — planning is a first-class management module: work breakdown, dependencies, planned dates, actual progress, responsible resources, and schedule-vs-fact comparison
3. Work execution
4. Materials and logistics
5. Money / budget / payments
6. People / contractors
7. Quality and acceptance
8. Safety
9. Drawings and documents
10. Photos / evidence
11. Early warning
12. AI agents and external tools

## MVP rule
Do not remove or break the existing safety application. The management layer is added alongside it and can later share authentication, project selection, language, storage, and navigation.

## Project Memory entities
- Project
- Object / Building / Zone / Apartment
- Decision
- Agreement / message-derived fact
- Task
- Work package
- Progress record
- Material
- Order / delivery / consumption
- Cost / payment / receipt
- Person / company / contractor
- Document / drawing revision
- Photo / evidence
- Quality issue / acceptance
- Safety observation
- Risk / early warning
- Calendar event
- AI analysis / recommendation
- Human decision / approval
- Result / verification

## Mandatory links
Each record should carry:
- project_id
- object_id when applicable
- source_id / evidence reference when applicable
- created_at
- updated_at
- created_by
- status
- confidence when AI-derived
- decision_required when applicable

## Audit principle
Never silently overwrite important project facts. Corrections should create a new record/version and preserve the previous value and source.

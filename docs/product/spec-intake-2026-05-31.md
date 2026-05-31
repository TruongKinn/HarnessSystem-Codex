# Spec Intake

Date: 2026-05-31

## Source

- Attached file: `SPEC.md`
- User direction: understand the current codebase, discover available skills/tools, and use Harness before implementation.

## Project Summary

Build a team workspace web application for task management with authentication,
RBAC, projects, tasks, workflow statuses, Kanban, calendar scheduling,
notifications, and audit logs.

The selected product stack from the source spec is:

- Backend: Spring Boot, Java 17
- Frontend: Angular with NG-ZORRO Ant Design
- Auth provider: Keycloak, with Google and GitHub identity providers
- API security: Bearer JWT validated by the backend
- Database: PostgreSQL
- Local MVP runtime: Docker Compose

## Candidate Product Docs

| File | Purpose | Source sections |
| --- | --- | --- |
| `docs/product/overview.md` | Product scope, MVP phases, user surfaces | 1, 2, 3, 9, 11 |
| `docs/product/auth-access.md` | Authentication, authorization, RBAC, user sync | 4.1, 4.2, 4.5, 5.1 |
| `docs/product/workspaces-projects.md` | Workspace, project, and membership rules | 4.3, 4.4 |
| `docs/product/tasks-workflow-kanban.md` | Task, workflow, transition, and board behavior | 4.6, 4.7, 4.8 |
| `docs/product/calendar-notifications-audit.md` | Calendar, reminders, notifications, and audit records | 4.9, 4.10, 4.11 |
| `docs/product/technical-architecture.md` | Stack, runtime surfaces, storage, validation ladder | 5, 6, 8 |

## Candidate Epics

| Epic | Description | Status |
| --- | --- | --- |
| E01-foundation | Scaffold backend, frontend, Docker Compose, Keycloak, PostgreSQL, and health checks | unsliced |
| E02-auth-access | Login/logout, social login via Keycloak, JWT validation, `/api/me`, user sync, RBAC foundation | unsliced |
| E03-workspaces-projects | Workspace and project CRUD, member management, scoped access | unsliced |
| E04-tasks | Task CRUD, assignment, labels, checklist, comments, due dates | unsliced |
| E05-workflow-kanban | Configurable workflow, transition validation, Kanban board, drag/drop ordering | unsliced |
| E06-calendar-notifications | Calendar views, scheduling, recurring tasks, reminders, in-app/email notifications | unsliced |
| E07-admin-observability | Role/permission admin, audit log viewer, dashboard, operational health | unsliced |

## Architecture Questions

- Runtime stack: Spring Boot Java 17 API and Angular SPA.
- Product surfaces: browser SPA, backend API, scheduled worker behavior for reminders, local Docker Compose environment.
- Storage: PostgreSQL for product data; Keycloak for identity; optional Redis after MVP if scheduler/notifications need it.
- External providers: Keycloak, Google OAuth, GitHub OAuth, email provider or Mailhog locally.
- Deployment target: Docker Compose for MVP; Kubernetes or managed containers remains open.
- Security model: Keycloak authenticates, backend validates JWT and enforces workspace/project/task permissions.

## Validation Shape

| Layer | Expected proof |
| --- | --- |
| Unit | Domain rules, permission mapping, workflow transition validation, date/recurrence helpers |
| Integration | Spring Security JWT validation, JPA repositories, PostgreSQL migrations, Keycloak test integration where feasible |
| E2E | Login redirect, authenticated `/api/me`, workspace/project/task happy paths, Kanban move, calendar display |
| Platform | Docker Compose smoke for Angular, API, PostgreSQL, Keycloak, and health endpoints |
| Release | Full backend/frontend tests, API docs generation, migration check, Docker Compose clean boot |

## Open Decisions

- Whether the app is internal team software or multi-company SaaS.
- Whether users can self-register or must be invited.
- Whether custom roles are in MVP or fixed roles only.
- Whether project-level permissions are enough for MVP or task-level exceptions are required.
- Whether recurring tasks create task instances or render virtual calendar occurrences.
- Whether reminder delivery needs Redis/queue in MVP.
- Whether deployment should remain Docker Compose or target Kubernetes/managed containers.

## First Story Candidates

- US-001: Scaffold local development runtime and health checks.
- US-002: Create Spring Boot API shell with `/actuator/health`.
- US-003: Create Angular NG-ZORRO shell layout.
- US-004: Configure Keycloak realm and JWT validation path.
- US-005: Implement `/api/me` and first-login user sync.

## Harness Delta

- Created product contract docs from `SPEC.md`.
- Recorded local friction: installed Harness CLI binary is Linux ELF and does not run in current Windows PowerShell; WSL execution fails because the binary requires `GLIBC_2.39`.

# Story Backlog

This backlog is seeded from `SPEC.md` after the initial Harness intake.

Do not create every possible story packet up front. Create story packets when
the work is selected or when a product decision needs a durable place to land.

## Candidate Epics

| Epic | Description | Status |
| --- | --- | --- |
| E01-foundation | Scaffold Spring Boot, Angular, Docker Compose, Keycloak, PostgreSQL, and health checks | unsliced |
| E02-auth-access | Login/logout, social login through Keycloak, JWT validation, `/api/me`, user sync, RBAC foundation | unsliced |
| E03-workspaces-projects | Workspace and project CRUD, member management, scoped access | unsliced |
| E04-tasks | Task CRUD, assignment, labels, checklist, comments, due dates | unsliced |
| E05-workflow-kanban | Configurable workflow, transition validation, Kanban board, drag/drop ordering | unsliced |
| E06-calendar-notifications | Calendar views, scheduling, recurring tasks, reminders, in-app/email notifications | unsliced |
| E07-admin-observability | Role/permission admin, workflow settings UI, audit log viewer, dashboard, operational health | unsliced |

## First Story Candidates

| Story | Epic | Title | Lane | Notes |
| --- | --- | --- | --- | --- |
| US-001 | E01-foundation | Scaffold local development runtime and health checks | normal | In progress: `docs/stories/US-001-foundation-runtime-health.md` |
| US-002 | E01-foundation | Create Spring Boot API shell with `/actuator/health` | normal | Depends on build tool choice |
| US-003 | E01-foundation | Create Angular NG-ZORRO shell layout | normal | Include app layout only, no domain screens yet |
| US-004 | E02-auth-access | Configure Keycloak and backend JWT validation path | high-risk | Auth hard gate |
| US-005 | E02-auth-access | Implement `/api/me` and first-login user sync | high-risk | Auth, data model, public API |

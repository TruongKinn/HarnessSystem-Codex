# Technical Architecture

## Stack

| Area | Choice |
| --- | --- |
| Backend | Spring Boot, Java 17 |
| Security | Spring Security OAuth2 Resource Server |
| Frontend | Angular with NG-ZORRO Ant Design |
| Auth provider | Keycloak |
| Social identity | Google and GitHub through Keycloak |
| Database | PostgreSQL |
| Migration | Flyway or Liquibase; final choice is open |
| API docs | OpenAPI / Swagger |
| Backend tests | JUnit 5, Mockito, Testcontainers |
| Frontend tests | Angular test runner plus Playwright E2E |
| Local runtime | Docker Compose |

## Product Surfaces

- Angular browser SPA.
- Spring Boot REST API under `/api`.
- Keycloak admin/runtime configuration.
- PostgreSQL database.
- Scheduler or worker behavior for reminders after the foundation phase.
- Mailhog or email adapter for local notification proof.

## Boundary Rules

- Parse and validate all HTTP request bodies, params, and query strings before application logic.
- Parse Keycloak JWT claims into typed application identity before permission checks.
- Keep backend authorization checks server-side.
- Keep audit logs as domain records separate from operational logs.
- Do not expose stack traces to clients.

## Initial API Areas

- Auth/user: `/api/me`, `/api/me/permissions`
- Workspace: `/api/workspaces`
- Project: `/api/workspaces/{workspaceId}/projects`, `/api/projects/{projectId}`
- Task: `/api/projects/{projectId}/tasks`, `/api/tasks/{taskId}`
- Kanban: `/api/projects/{projectId}/kanban`
- Calendar: `/api/calendar/events`
- Workflow: `/api/projects/{projectId}/workflow`
- RBAC: `/api/roles`, `/api/permissions`
- Audit: task and project audit log endpoints

## Data Model Areas

- Identity: `app_user`
- Collaboration: `workspace`, `workspace_member`, `project`, `project_member`
- Access: `role`, `permission`, `role_permission`, `user_project_role`
- Workflow: `workflow`, `workflow_status`, `workflow_transition`, `workflow_transition_role`
- Tasks: `task`, `task_label`, `task_comment`, `task_checklist_item`, `task_attachment`
- Operations: `notification`, `audit_log`

## Observability

Backend request logs should include:

- timestamp
- level
- request id
- user id when known
- action
- duration in milliseconds
- status code
- message

Health endpoint:

- `GET /actuator/health`

## Validation Ladder

| Stage | Expected checks |
| --- | --- |
| Quick | Format, lint, typecheck/compile, focused unit tests |
| Integration | Spring Boot context, security, repository, PostgreSQL, Keycloak boundary checks |
| E2E | Browser flows for auth, task, Kanban, calendar |
| Platform | Docker Compose clean boot and service health smoke |
| Release | Full test suite, migrations, API docs, logs, performance smoke |

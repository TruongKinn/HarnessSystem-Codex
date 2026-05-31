# Product Overview

## Product

Todo Kanban Calendar App is a team workspace task management web application.

## Users

- System admins operate the whole installation.
- Workspace admins manage workspace members and projects.
- Project admins manage project settings, workflow, and project members.
- Managers coordinate task assignment and completion.
- Members work on assigned or permitted tasks.
- Viewers and guests receive read-limited access.

## In Scope

- Keycloak login/logout.
- Google and GitHub login through Keycloak identity providers.
- JWT-protected backend APIs.
- User profile and first-login user sync.
- Workspace and project management.
- RBAC by role and permission.
- Task CRUD, assignment, priority, labels, comments, checklist, dates.
- Configurable workflow statuses and transitions.
- Kanban board with drag/drop movement.
- Calendar scheduling by week and month for MVP.
- Recurring task support using RRULE.
- In-app and email notifications.
- Audit log for sensitive and task-changing actions.

## MVP Phases

| Phase | Scope |
| --- | --- |
| 1 | Spring Boot, Angular, Docker Compose, Keycloak, login/logout, `/api/me`, user sync |
| 2 | Workspace, project, member management, fixed RBAC, backend permission checks |
| 3 | Task CRUD, assignment, priority, labels, due dates, comments, checklist |
| 4 | Workflow defaults, transition validation, Kanban board, drag/drop, transition audit |
| 5 | Week/month calendar, scheduling, recurring tasks, in-app and email reminders |
| 6 | Role/permission admin, workflow settings UI, audit log viewer, dashboard |

## Non-Goals For MVP

- Native mobile apps.
- Chat realtime.
- Billing or subscriptions.
- AI assistant.
- Offline mode.
- Google Calendar or Outlook sync.

## Open Product Questions

- Is this an internal team app or SaaS with multiple companies?
- Are users self-registered or invite-only?
- Is guest access required in MVP?
- Should calendar recurrence create concrete tasks or only virtual events?
- Is task-level permission override required in MVP?

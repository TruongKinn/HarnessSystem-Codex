# Auth And Access

## Authentication

The application uses Keycloak as the identity provider.

Required login paths:

- Keycloak username/password login.
- Google login through Keycloak identity provider configuration.
- GitHub login through Keycloak identity provider configuration.
- Logout clears frontend token state and ends the Keycloak session.

## Backend JWT Rules

- All private APIs require `Authorization: Bearer <access_token>`.
- Backend validates issuer, signature, audience/client expectations, and expiry.
- Missing or invalid tokens return `401 Unauthorized`.
- Valid tokens map to an authenticated principal.

## User Sync

On first successful login, the backend creates an internal `app_user` record.

Required fields:

- `id`
- `keycloak_user_id`
- `email`
- `username`
- `display_name`
- `avatar_url`
- `status`
- `created_at`
- `updated_at`

Later logins must not create duplicates and should refresh profile fields when
Keycloak provides updated values.

## Roles

MVP uses fixed role codes:

- `SYSTEM_ADMIN`
- `WORKSPACE_ADMIN`
- `PROJECT_ADMIN`
- `MANAGER`
- `MEMBER`
- `VIEWER`
- `GUEST`

Role scope may be system, workspace, project, or task. MVP should prioritize
workspace and project scopes unless a selected story proves task-level scope is
needed.

## Permissions

Initial permission vocabulary:

- `workspace.read`
- `workspace.manage`
- `member.invite`
- `project.create`
- `project.read`
- `project.update`
- `project.delete`
- `workflow.manage`
- `board.read`
- `task.create`
- `task.read`
- `task.update`
- `task.delete`
- `task.assign`
- `task.transition`
- `task.schedule`
- `calendar.read`
- `calendar.manage`
- `audit.read`

## Enforcement

- Backend is the final authorization authority.
- Frontend may hide unavailable actions but cannot be trusted for permission decisions.
- Authenticated users without required permission receive `403 Forbidden`.
- Sensitive authorization changes and membership changes create audit records.

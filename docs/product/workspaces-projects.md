# Workspaces And Projects

## Workspace

A workspace is the top-level collaboration boundary for a team or organization.

Workspace fields from the source spec:

- `id`
- `name`
- `slug`
- `owner_id`
- `created_at`
- `updated_at`

## Workspace Rules

- A user with permission can create a workspace.
- The creator becomes `WORKSPACE_ADMIN`.
- Workspace slugs must be unique.
- Users only see workspaces where they are members or have system-level access.
- Workspace admins can invite members.
- Member invitations create audit records.

## Project

A project belongs to one workspace and contains tasks, workflow configuration,
project members, and board/calendar views.

Project fields from the source spec:

- `id`
- `workspace_id`
- `name`
- `key`
- `description`
- `default_workflow_id`
- `created_at`
- `updated_at`

## Project Rules

- Project keys must be unique within a workspace.
- The project creator becomes `PROJECT_ADMIN`.
- Users only see projects where workspace/project permissions allow access.
- Project admins can update project metadata.
- Delete behavior is not settled; selected implementation stories should decide hard delete, soft delete, or archive.

## API Contract Candidates

- `GET /api/workspaces`
- `POST /api/workspaces`
- `GET /api/workspaces/{workspaceId}`
- `PATCH /api/workspaces/{workspaceId}`
- `DELETE /api/workspaces/{workspaceId}`
- `GET /api/workspaces/{workspaceId}/projects`
- `POST /api/workspaces/{workspaceId}/projects`
- `GET /api/projects/{projectId}`
- `PATCH /api/projects/{projectId}`
- `DELETE /api/projects/{projectId}`
- `POST /api/workspaces/{workspaceId}/members`

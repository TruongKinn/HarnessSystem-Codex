# Tasks, Workflow, And Kanban

## Task

A task belongs to a workspace and project.

Core task fields from the source spec:

- `id`
- `workspace_id`
- `project_id`
- `status_id`
- `title`
- `description`
- `priority`
- `assignee_id`
- `reporter_id`
- `parent_task_id`
- `start_at`
- `end_at`
- `due_at`
- `completed_at`
- `timezone`
- `recurrence_rule`
- `recurrence_until`
- `sort_order`
- `deleted_at`
- `created_at`
- `updated_at`

## Task Rules

- A created task starts in the first workflow status, such as `BACKLOG` or `TODO`.
- Reporter is the user who created the task.
- Assignee must belong to the project or workspace.
- Deletes should be soft deletes unless a later decision changes this.
- Task-changing actions create audit records when they affect assignment, status, due date, priority, or deletion.

## Task Features

- Create, read, update, delete.
- Assign task.
- Priority.
- Labels.
- Dates.
- Comments.
- Checklist items.
- Optional parent task or subtask behavior after MVP.

## Workflow

Default workflow candidate:

```text
BACKLOG -> TODO -> IN_PROGRESS -> REVIEW -> DONE
                    |
                    v
                 BLOCKED
```

Additional terminal or administrative statuses:

- `CANCELLED`
- `ARCHIVED`

Workflow statuses include code, name, category, color, order, WIP limit, and
terminal flag.

## Transition Rules

- Tasks can move only through defined workflow transitions.
- Backend validates permission and transition availability.
- Some transitions may require role checks or comments.
- Moving to `DONE` sets `completed_at`.
- Invalid transitions return a client-visible error.

## Kanban

The Kanban board groups tasks by workflow status.

Board cards should show:

- Title.
- Priority.
- Assignee avatar.
- Due date.
- Labels.
- Comment count.
- Checklist progress.
- Overdue indicator.

MVP should support filtering by assignee, priority, label, due date, status, and
keyword when the task API supports those query inputs.

## API Contract Candidates

- `GET /api/projects/{projectId}/tasks`
- `POST /api/projects/{projectId}/tasks`
- `GET /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}`
- `DELETE /api/tasks/{taskId}`
- `POST /api/tasks/{taskId}/assign`
- `POST /api/tasks/{taskId}/transition`
- `POST /api/tasks/{taskId}/schedule`
- `GET /api/projects/{projectId}/kanban`
- `PATCH /api/tasks/{taskId}/move`

# Calendar, Notifications, And Audit

## Calendar

Calendar shows scheduled tasks.

MVP views:

- Week.
- Month.

Later views:

- Day.
- Year.

Calendar interactions:

- Click a task event to open task detail.
- Filter by project, assignee, and priority.
- Color events by status or priority.
- Drag/drop event rescheduling only when backend authorization allows it.

## Scheduling

Task schedule fields:

- `startAt`
- `endAt`
- `dueAt`
- `allDay`
- `timezone`

Timezone ownership is open. The source spec suggests `Asia/Bangkok` in payload
examples, but the final rule should decide whether timezone follows user,
workspace, or task.

## Recurrence

Recurring tasks use RRULE syntax.

Open product decision:

- Render recurrence as virtual calendar events.
- Or materialize recurring task instances.

## Notifications

In-app notifications are created when:

- User is assigned a task.
- Task is near deadline.
- Task is overdue.
- Task status changes.
- User is mentioned in a comment.
- User is added to a workspace or project.

Email notifications are sent when:

- User is invited to a workspace.
- User is assigned an important task.
- Task is near deadline.
- Task is overdue.

Local MVP should use Mailhog or equivalent for email proof.

## Audit Log

Audit records are product records, not application logs.

Audit-worthy actions:

- Create, update, delete task.
- Assign task.
- Transition task.
- Change deadline.
- Change priority.
- Add or remove member.
- Change role or permission.

Audit fields from the source spec:

- `id`
- `workspace_id`
- `project_id`
- `entity_type`
- `entity_id`
- `action`
- `actor_id`
- `old_value`
- `new_value`
- `created_at`

## API Contract Candidates

- `GET /api/calendar/events`
- `GET /api/tasks/{taskId}/audit-logs`
- `GET /api/projects/{projectId}/audit-logs`

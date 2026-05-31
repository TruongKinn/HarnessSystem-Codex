Đúng rồi, mình đổi lại thành **SPEC**. Dưới đây là bản **Software/Product Specification v0.1** cho application của bạn.

# SPEC v0.1 — Todo Kanban Calendar App

## 1. Tổng quan

### 1.1. Tên ứng dụng

**Todo Kanban Calendar App**

### 1.2. Mục tiêu

Xây dựng một web application quản lý công việc có các chức năng chính:

* Đăng nhập bằng **Keycloak**.
* Hỗ trợ login bằng **Google** và **GitHub** thông qua Keycloak.
* Backend dùng **Spring Boot Java 17**.
* Frontend dùng **Angular + NG-ZORRO Ant Design**.
* API bảo vệ bằng **Bearer Token / JWT**.
* Quản lý todo/task.
* Quản lý workflow nhiều trạng thái.
* Hiển thị công việc dạng **Kanban board**.
* Lên lịch công việc theo **tuần, tháng, năm**.
* Hỗ trợ phân quyền theo **RBAC**.
* Hỗ trợ nhiều user cùng làm việc trong project/workspace.

---

## 2. Phạm vi hệ thống

### 2.1. In scope

Ứng dụng cần có:

| Nhóm chức năng  | Mô tả                                         |
| --------------- | --------------------------------------------- |
| Authentication  | Login/logout qua Keycloak, Google, GitHub     |
| Authorization   | RBAC theo role/permission                     |
| User Management | Quản lý user, thông tin user, trạng thái user |
| Workspace       | Không gian làm việc cho nhóm hoặc tổ chức     |
| Project         | Quản lý project trong workspace               |
| Task/Todo       | Tạo, sửa, xóa, assign, cập nhật task          |
| Workflow        | Quản lý status flow của task                  |
| Kanban          | Hiển thị task theo cột trạng thái             |
| Calendar        | Lịch công việc theo tuần/tháng/năm            |
| Notification    | Nhắc lịch, task overdue, task assigned        |
| Audit Log       | Lưu lịch sử thay đổi quan trọng               |

### 2.2. Out of scope cho MVP

Các phần chưa cần làm trong bản đầu:

| Chức năng             | Ghi chú                         |
| --------------------- | ------------------------------- |
| Mobile app native     | Có thể làm sau                  |
| Chat realtime         | Chưa cần trong MVP              |
| Billing/subscription  | Chỉ cần nếu làm SaaS thương mại |
| AI assistant          | Có thể bổ sung sau              |
| Offline mode          | Chưa cần                        |
| Google Calendar sync  | Có thể để phase sau             |
| Outlook Calendar sync | Có thể để phase sau             |

---

## 3. Đối tượng sử dụng

### 3.1. User roles đề xuất

| Role              | Mô tả                                          |
| ----------------- | ---------------------------------------------- |
| `SYSTEM_ADMIN`    | Quản trị toàn hệ thống                         |
| `WORKSPACE_ADMIN` | Quản trị workspace, user, project              |
| `PROJECT_ADMIN`   | Quản trị project, board, workflow              |
| `MANAGER`         | Quản lý task, phân công, duyệt task            |
| `MEMBER`          | Làm việc với task được phân quyền              |
| `VIEWER`          | Chỉ xem dữ liệu                                |
| `GUEST`           | Người ngoài được mời vào project/task giới hạn |

### 3.2. Phạm vi role

Role có thể áp dụng theo nhiều cấp:

| Scope     | Ví dụ                                       |
| --------- | ------------------------------------------- |
| System    | User A là `SYSTEM_ADMIN` toàn hệ thống      |
| Workspace | User B là `WORKSPACE_ADMIN` của workspace X |
| Project   | User C là `PROJECT_ADMIN` của project Y     |
| Task      | User D chỉ được xem/sửa một task cụ thể     |

Đề xuất cho MVP:

* Keycloak quản lý authentication và role tổng quát.
* Database của application quản lý permission chi tiết theo workspace/project/task.

---

# 4. Functional Requirements

## 4.1. Authentication

### AUTH-001 — Login bằng Keycloak

Người dùng có thể đăng nhập bằng tài khoản được quản lý bởi Keycloak.

**Acceptance Criteria:**

* User truy cập app khi chưa login sẽ được redirect sang Keycloak.
* Sau khi login thành công, user quay lại Angular app.
* Angular nhận access token.
* Angular gọi API với header:

```http
Authorization: Bearer <access_token>
```

---

### AUTH-002 — Login bằng Google

Người dùng có thể login bằng Google thông qua Keycloak Identity Provider.

**Acceptance Criteria:**

* Màn hình login hiển thị nút login Google.
* User login thành công bằng Google.
* Keycloak tạo hoặc link account tương ứng.
* Backend nhận token hợp lệ từ Keycloak.

---

### AUTH-003 — Login bằng GitHub

Người dùng có thể login bằng GitHub thông qua Keycloak Identity Provider.

**Acceptance Criteria:**

* Màn hình login hiển thị nút login GitHub.
* User login thành công bằng GitHub.
* Keycloak tạo hoặc link account tương ứng.
* Backend nhận token hợp lệ từ Keycloak.

---

### AUTH-004 — Logout

Người dùng có thể logout khỏi hệ thống.

**Acceptance Criteria:**

* Token phía frontend bị clear.
* Session Keycloak bị logout.
* User quay lại màn hình login.
* API không còn được gọi bằng token cũ sau logout.

---

### AUTH-005 — Token validation

Backend phải validate JWT access token.

**Acceptance Criteria:**

* Request không có token bị trả về `401 Unauthorized`.
* Request có token sai issuer bị từ chối.
* Request có token hết hạn bị từ chối.
* Request hợp lệ được map thành authenticated principal.

---

## 4.2. User Management

### USER-001 — Đồng bộ user từ Keycloak

Khi user login lần đầu, hệ thống cần tạo bản ghi user nội bộ.

Bảng `app_user` lưu:

| Field              | Mô tả                     |
| ------------------ | ------------------------- |
| `id`               | ID nội bộ                 |
| `keycloak_user_id` | ID user từ Keycloak       |
| `email`            | Email                     |
| `username`         | Username                  |
| `display_name`     | Tên hiển thị              |
| `avatar_url`       | Ảnh đại diện              |
| `status`           | Active, inactive, blocked |
| `created_at`       | Ngày tạo                  |
| `updated_at`       | Ngày cập nhật             |

**Acceptance Criteria:**

* User login lần đầu được tạo trong DB.
* User login lần sau không bị tạo trùng.
* Email, name, avatar được sync nếu có.

---

### USER-002 — Xem thông tin cá nhân

User có thể xem thông tin cá nhân của mình.

API đề xuất:

```http
GET /api/me
```

Response mẫu:

```json
{
  "id": "user-001",
  "email": "user@example.com",
  "username": "john",
  "displayName": "John Nguyen",
  "avatarUrl": "https://example.com/avatar.png",
  "roles": ["MEMBER"],
  "permissions": ["task.read", "task.create"]
}
```

---

## 4.3. Workspace Management

### WS-001 — Tạo workspace

User có quyền phù hợp có thể tạo workspace.

API đề xuất:

```http
POST /api/workspaces
```

Payload:

```json
{
  "name": "My Workspace",
  "slug": "my-workspace"
}
```

**Acceptance Criteria:**

* Workspace được tạo thành công.
* Người tạo trở thành `WORKSPACE_ADMIN`.
* Slug không được trùng.

---

### WS-002 — Xem danh sách workspace

User xem được danh sách workspace mà mình là thành viên.

API đề xuất:

```http
GET /api/workspaces
```

**Acceptance Criteria:**

* User chỉ thấy workspace mình có quyền truy cập.
* Không thấy workspace của người khác nếu không được phân quyền.

---

### WS-003 — Mời thành viên vào workspace

Workspace admin có thể mời user vào workspace.

API đề xuất:

```http
POST /api/workspaces/{workspaceId}/members
```

Payload:

```json
{
  "email": "member@example.com",
  "roleCode": "MEMBER"
}
```

**Acceptance Criteria:**

* Chỉ `WORKSPACE_ADMIN` được mời thành viên.
* User được thêm vào workspace.
* Hệ thống ghi audit log.

---

## 4.4. Project Management

### PRJ-001 — Tạo project

User có quyền có thể tạo project trong workspace.

API đề xuất:

```http
POST /api/workspaces/{workspaceId}/projects
```

Payload:

```json
{
  "name": "Todo App",
  "key": "TODO",
  "description": "Project quản lý todo"
}
```

**Acceptance Criteria:**

* Project thuộc một workspace.
* Project key không trùng trong workspace.
* Người tạo project được gán quyền `PROJECT_ADMIN`.

---

### PRJ-002 — Xem project

User chỉ xem được project mà mình có quyền.

API đề xuất:

```http
GET /api/projects/{projectId}
```

---

### PRJ-003 — Cập nhật project

Project admin có thể sửa thông tin project.

API đề xuất:

```http
PATCH /api/projects/{projectId}
```

---

## 4.5. RBAC

### RBAC-001 — Quản lý role

Hệ thống hỗ trợ role mặc định:

```text
SYSTEM_ADMIN
WORKSPACE_ADMIN
PROJECT_ADMIN
MANAGER
MEMBER
VIEWER
GUEST
```

MVP có thể dùng role cố định. Sau MVP có thể cho admin tự tạo role.

---

### RBAC-002 — Quản lý permission

Permission đề xuất:

| Permission         | Mô tả                  |
| ------------------ | ---------------------- |
| `workspace.read`   | Xem workspace          |
| `workspace.manage` | Quản lý workspace      |
| `member.invite`    | Mời thành viên         |
| `project.create`   | Tạo project            |
| `project.read`     | Xem project            |
| `project.update`   | Sửa project            |
| `project.delete`   | Xóa project            |
| `workflow.manage`  | Quản lý workflow       |
| `board.read`       | Xem Kanban board       |
| `task.create`      | Tạo task               |
| `task.read`        | Xem task               |
| `task.update`      | Sửa task               |
| `task.delete`      | Xóa task               |
| `task.assign`      | Gán task               |
| `task.transition`  | Chuyển trạng thái task |
| `task.schedule`    | Cài lịch task          |
| `calendar.read`    | Xem calendar           |
| `calendar.manage`  | Quản lý calendar       |
| `audit.read`       | Xem audit log          |

---

### RBAC-003 — Kiểm tra quyền ở backend

Backend phải kiểm tra quyền ở mọi API quan trọng.

Ví dụ:

| API                                   | Permission cần có |
| ------------------------------------- | ----------------- |
| `POST /api/tasks`                     | `task.create`     |
| `PATCH /api/tasks/{taskId}`           | `task.update`     |
| `DELETE /api/tasks/{taskId}`          | `task.delete`     |
| `POST /api/tasks/{taskId}/transition` | `task.transition` |
| `POST /api/tasks/{taskId}/assign`     | `task.assign`     |
| `GET /api/calendar/events`            | `calendar.read`   |

**Acceptance Criteria:**

* Frontend không quyết định quyền cuối cùng.
* Backend luôn kiểm tra quyền.
* User không có quyền nhận `403 Forbidden`.
* User chưa login nhận `401 Unauthorized`.

---

## 4.6. Task/Todo Management

### TASK-001 — Tạo task

User có quyền có thể tạo task trong project.

API đề xuất:

```http
POST /api/projects/{projectId}/tasks
```

Payload:

```json
{
  "title": "Thiết kế màn hình login",
  "description": "Tạo UI login với NG-ZORRO",
  "priority": "HIGH",
  "assigneeId": "user-001",
  "startAt": "2026-06-01T09:00:00+07:00",
  "dueAt": "2026-06-03T18:00:00+07:00",
  "labels": ["frontend", "auth"]
}
```

**Acceptance Criteria:**

* Task được tạo trong project.
* Task mặc định nằm ở status đầu tiên của workflow, ví dụ `TODO` hoặc `BACKLOG`.
* Task có reporter là người tạo.
* Nếu có assignee, assignee phải thuộc project/workspace.

---

### TASK-002 — Cập nhật task

User có quyền có thể cập nhật task.

API đề xuất:

```http
PATCH /api/tasks/{taskId}
```

Có thể cập nhật:

* Title.
* Description.
* Priority.
* Assignee.
* Start date.
* Due date.
* Labels.
* Estimate.
* Parent task.

---

### TASK-003 — Xóa task

User có quyền có thể xóa task.

API đề xuất:

```http
DELETE /api/tasks/{taskId}
```

Đề xuất dùng soft delete:

```text
deleted_at
deleted_by
```

---

### TASK-004 — Assign task

User có quyền có thể gán task cho thành viên khác.

API đề xuất:

```http
POST /api/tasks/{taskId}/assign
```

Payload:

```json
{
  "assigneeId": "user-002"
}
```

**Acceptance Criteria:**

* Assignee phải thuộc project/workspace.
* Hệ thống ghi audit log.
* Người được assign nhận notification.

---

### TASK-005 — Subtask/checklist

Task có thể có subtask hoặc checklist.

Đề xuất MVP:

* Hỗ trợ checklist item đơn giản trước.
* Subtask đầy đủ làm ở phase sau nếu cần.

Checklist item:

```json
{
  "title": "Tạo component login",
  "completed": false
}
```

---

### TASK-006 — Comment task

User có quyền có thể comment trên task.

API đề xuất:

```http
POST /api/tasks/{taskId}/comments
```

Payload:

```json
{
  "content": "Cần kiểm tra thêm flow login Google."
}
```

---

## 4.7. Workflow / Status Flow

### WF-001 — Workflow mặc định

Workflow mặc định đề xuất:

```text
BACKLOG → TODO → IN_PROGRESS → REVIEW → DONE
                    ↓
                 BLOCKED
```

Có thêm status phụ:

```text
CANCELLED
ARCHIVED
```

---

### WF-002 — Status

Mỗi workflow gồm nhiều status.

Bảng `workflow_status`:

| Field         | Mô tả                             |
| ------------- | --------------------------------- |
| `id`          | ID status                         |
| `workflow_id` | Thuộc workflow nào                |
| `code`        | Mã status, ví dụ `IN_PROGRESS`    |
| `name`        | Tên hiển thị                      |
| `category`    | Todo, Doing, Done, Blocked        |
| `color`       | Màu hiển thị                      |
| `sort_order`  | Thứ tự cột                        |
| `is_terminal` | Có phải trạng thái kết thúc không |

---

### WF-003 — Transition

Task chỉ được chuyển trạng thái theo transition được định nghĩa.

Ví dụ transition:

| From          | To            | Điều kiện                  |
| ------------- | ------------- | -------------------------- |
| `BACKLOG`     | `TODO`        | Có quyền `task.transition` |
| `TODO`        | `IN_PROGRESS` | Assignee hoặc Manager      |
| `IN_PROGRESS` | `REVIEW`      | Assignee                   |
| `REVIEW`      | `DONE`        | Manager hoặc Project Admin |
| `IN_PROGRESS` | `BLOCKED`     | Assignee hoặc Manager      |
| `BLOCKED`     | `IN_PROGRESS` | Assignee hoặc Manager      |
| Any           | `CANCELLED`   | Manager hoặc Project Admin |

---

### WF-004 — Chuyển trạng thái task

API đề xuất:

```http
POST /api/tasks/{taskId}/transition
```

Payload:

```json
{
  "targetStatusCode": "REVIEW",
  "comment": "Đã hoàn thành phần frontend."
}
```

**Acceptance Criteria:**

* Backend kiểm tra token.
* Backend kiểm tra user có quyền với task.
* Backend kiểm tra transition hợp lệ.
* Backend kiểm tra role có được phép transition không.
* Nếu transition yêu cầu comment thì comment không được rỗng.
* Khi chuyển sang `DONE`, hệ thống set `completed_at`.
* Hệ thống ghi audit log.

---

## 4.8. Kanban Board

### KANBAN-001 — Hiển thị board

User có quyền có thể xem Kanban board của project.

API đề xuất:

```http
GET /api/projects/{projectId}/kanban
```

Response mẫu:

```json
{
  "projectId": "project-001",
  "columns": [
    {
      "statusCode": "TODO",
      "statusName": "Todo",
      "tasks": []
    },
    {
      "statusCode": "IN_PROGRESS",
      "statusName": "In Progress",
      "tasks": []
    },
    {
      "statusCode": "DONE",
      "statusName": "Done",
      "tasks": []
    }
  ]
}
```

---

### KANBAN-002 — Drag and drop task

User có thể kéo task giữa các column.

API đề xuất:

```http
POST /api/tasks/{taskId}/transition
```

hoặc:

```http
PATCH /api/tasks/{taskId}/move
```

Payload:

```json
{
  "targetStatusId": "status-002",
  "targetOrder": 1200
}
```

**Acceptance Criteria:**

* Kéo sang status hợp lệ thì cập nhật thành công.
* Kéo sang status không hợp lệ thì frontend rollback.
* Backend không cho phép bypass workflow.
* Backend ghi audit log.

---

### KANBAN-003 — Sort task trong column

Task trong một column có thể thay đổi thứ tự.

**Acceptance Criteria:**

* User kéo task lên/xuống trong cùng column.
* Hệ thống cập nhật `sort_order`.
* Các user khác reload sẽ thấy đúng thứ tự.

---

### KANBAN-004 — Filter/search Kanban

Board hỗ trợ filter:

* Assignee.
* Priority.
* Label.
* Due date.
* Status.
* Keyword.

---

### KANBAN-005 — WIP limit

Mỗi column có thể có giới hạn số task đang active.

Ví dụ:

| Status        | WIP Limit |
| ------------- | --------- |
| `IN_PROGRESS` | 5         |
| `REVIEW`      | 3         |

MVP có thể chỉ cảnh báo. Sau MVP có thể chặn hẳn.

---

## 4.9. Calendar / Schedule

### CAL-001 — Xem calendar

User có thể xem task trên calendar.

Calendar view cần có:

| View  | Mô tả          |
| ----- | -------------- |
| Day   | Xem theo ngày  |
| Week  | Xem theo tuần  |
| Month | Xem theo tháng |
| Year  | Xem theo năm   |

MVP nên làm trước:

* Week view.
* Month view.

---

### CAL-002 — Schedule task

User có thể gắn lịch cho task.

API đề xuất:

```http
POST /api/tasks/{taskId}/schedule
```

Payload:

```json
{
  "startAt": "2026-06-01T09:00:00+07:00",
  "endAt": "2026-06-01T11:00:00+07:00",
  "dueAt": "2026-06-03T18:00:00+07:00",
  "allDay": false,
  "timezone": "Asia/Bangkok"
}
```

---

### CAL-003 — Recurring task

Task có thể lặp theo:

* Hàng ngày.
* Hàng tuần.
* Hàng tháng.
* Hàng năm.

Đề xuất dùng format RRULE.

Ví dụ lặp hàng tuần vào thứ Hai, Tư, Sáu:

```text
FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR
```

Ví dụ lặp hàng tháng ngày 15:

```text
FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=15
```

Ví dụ lặp hàng năm ngày 31/12:

```text
FREQ=YEARLY;INTERVAL=1;BYMONTH=12;BYMONTHDAY=31
```

---

### CAL-004 — Lấy event theo date range

API đề xuất:

```http
GET /api/calendar/events?from=2026-06-01&to=2026-06-30
```

Response mẫu:

```json
[
  {
    "id": "event-001",
    "taskId": "task-001",
    "title": "Review task",
    "startAt": "2026-06-01T09:00:00+07:00",
    "endAt": "2026-06-01T10:00:00+07:00",
    "status": "IN_PROGRESS",
    "priority": "HIGH"
  }
]
```

---

### CAL-005 — Reminder

User có thể cấu hình nhắc lịch.

Ví dụ:

```json
{
  "reminders": [
    {
      "type": "EMAIL",
      "offsetMinutes": 1440
    },
    {
      "type": "IN_APP",
      "offsetMinutes": 60
    }
  ]
}
```

Channel MVP:

* In-app notification.
* Email.

Sau MVP:

* Web push.
* Slack.
* Telegram.
* Microsoft Teams.

---

## 4.10. Notification

### NOTI-001 — In-app notification

Hệ thống tạo notification khi:

* User được assign task.
* Task gần đến hạn.
* Task quá hạn.
* Task đổi trạng thái.
* User được mention trong comment.
* User được thêm vào workspace/project.

---

### NOTI-002 — Email notification

Hệ thống gửi email khi:

* User được mời vào workspace.
* User được assign task quan trọng.
* Task gần deadline.
* Task overdue.

---

## 4.11. Audit Log

### AUDIT-001 — Ghi log thay đổi task

Hệ thống cần ghi lại các hành động:

* Tạo task.
* Sửa task.
* Xóa task.
* Assign task.
* Chuyển trạng thái.
* Thay đổi deadline.
* Thay đổi priority.
* Thêm/xóa member.
* Thay đổi role/permission.

Bảng đề xuất:

```text
audit_log
- id
- workspace_id
- project_id
- entity_type
- entity_id
- action
- actor_id
- old_value
- new_value
- created_at
```

---

# 5. Non-functional Requirements

## 5.1. Security

| Requirement | Mô tả                                        |
| ----------- | -------------------------------------------- |
| SEC-001     | Tất cả API private phải yêu cầu bearer token |
| SEC-002     | Backend validate JWT từ Keycloak             |
| SEC-003     | Backend kiểm tra RBAC, không tin frontend    |
| SEC-004     | CORS chỉ cho phép domain frontend hợp lệ     |
| SEC-005     | Không lưu client secret ở Angular            |
| SEC-006     | Không trả stacktrace ra client               |
| SEC-007     | Dữ liệu workspace/project phải được isolate  |
| SEC-008     | Ghi audit log cho hành động nhạy cảm         |

---

## 5.2. Performance

| Requirement | Mục tiêu                                                    |
| ----------- | ----------------------------------------------------------- |
| PERF-001    | API list task phản hồi dưới 500ms với dữ liệu trung bình    |
| PERF-002    | Kanban board load dưới 2 giây                               |
| PERF-003    | Calendar month view load dưới 2 giây                        |
| PERF-004    | Hỗ trợ pagination cho danh sách lớn                         |
| PERF-005    | Hỗ trợ index database cho workspace/project/status/due date |

---

## 5.3. Scalability

Hệ thống nên thiết kế để có thể scale theo hướng:

```text
Angular SPA
    ↓
Spring Boot API instances
    ↓
PostgreSQL
    ↓
Redis optional
    ↓
Scheduler/Worker optional
```

MVP có thể chạy bằng Docker Compose:

* Angular.
* Spring Boot API.
* PostgreSQL.
* Keycloak.
* Redis optional.
* Mailhog cho email local.

---

## 5.4. Observability

Cần có:

* Application logs.
* Error logs.
* Audit logs.
* API metrics.
* Health check.
* Database migration logs.

API health:

```http
GET /actuator/health
```

---

# 6. Technical Specification

## 6.1. Backend

### Stack

| Thành phần | Công nghệ                              |
| ---------- | -------------------------------------- |
| Language   | Java 17                                |
| Framework  | Spring Boot                            |
| Security   | Spring Security OAuth2 Resource Server |
| Database   | PostgreSQL                             |
| ORM        | Spring Data JPA / Hibernate            |
| Migration  | Flyway hoặc Liquibase                  |
| API docs   | OpenAPI / Swagger                      |
| Validation | Jakarta Bean Validation                |
| Mapping    | MapStruct                              |
| Test       | JUnit 5, Mockito, Testcontainers       |
| Build      | Maven hoặc Gradle                      |

---

## 6.2. Frontend

### Stack

| Thành phần  | Công nghệ                                              |
| ----------- | ------------------------------------------------------ |
| Framework   | Angular                                                |
| UI          | NG-ZORRO Ant Design                                    |
| Auth client | keycloak-js hoặc OIDC client                           |
| Forms       | Angular Reactive Forms                                 |
| Drag/drop   | Angular CDK DragDrop                                   |
| Calendar    | FullCalendar Angular hoặc custom component             |
| State       | RxJS service store, Angular Signals hoặc NgRx          |
| API client  | OpenAPI generated client hoặc Angular service thủ công |

---

## 6.3. Database

### Core tables

```text
app_user
workspace
workspace_member
project
project_member
role
permission
role_permission
user_project_role
workflow
workflow_status
workflow_transition
workflow_transition_role
task
task_label
task_comment
task_checklist_item
task_attachment
notification
audit_log
```

---

## 6.4. API structure

Base URL:

```http
/api
```

### Auth/user

```http
GET /api/me
GET /api/me/permissions
```

### Workspace

```http
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/{workspaceId}
PATCH  /api/workspaces/{workspaceId}
DELETE /api/workspaces/{workspaceId}
```

### Project

```http
GET    /api/workspaces/{workspaceId}/projects
POST   /api/workspaces/{workspaceId}/projects
GET    /api/projects/{projectId}
PATCH  /api/projects/{projectId}
DELETE /api/projects/{projectId}
```

### Task

```http
GET    /api/projects/{projectId}/tasks
POST   /api/projects/{projectId}/tasks
GET    /api/tasks/{taskId}
PATCH  /api/tasks/{taskId}
DELETE /api/tasks/{taskId}
POST   /api/tasks/{taskId}/assign
POST   /api/tasks/{taskId}/transition
POST   /api/tasks/{taskId}/schedule
```

### Kanban

```http
GET   /api/projects/{projectId}/kanban
PATCH /api/tasks/{taskId}/move
```

### Calendar

```http
GET /api/calendar/events
```

### Workflow

```http
GET    /api/projects/{projectId}/workflow
POST   /api/projects/{projectId}/workflow/statuses
PATCH  /api/workflow/statuses/{statusId}
POST   /api/workflow/transitions
DELETE /api/workflow/transitions/{transitionId}
```

### RBAC

```http
GET  /api/roles
POST /api/roles
GET  /api/permissions
POST /api/projects/{projectId}/members/{memberId}/roles
```

### Audit

```http
GET /api/tasks/{taskId}/audit-logs
GET /api/projects/{projectId}/audit-logs
```

---

# 7. UI Specification

## 7.1. Layout chính

Ứng dụng Angular dùng layout:

```text
Top Header
├── Logo
├── Workspace switcher
├── Search
├── Notification icon
└── User menu

Left Sidebar
├── Dashboard
├── Projects
├── My Tasks
├── Kanban
├── Calendar
├── Members
├── Settings

Main Content
└── Page content
```

---

## 7.2. Các màn hình chính

| Màn hình            | Mô tả                             |
| ------------------- | --------------------------------- |
| Login               | Redirect sang Keycloak            |
| Dashboard           | Tổng quan task, overdue, upcoming |
| Workspace List      | Danh sách workspace               |
| Project List        | Danh sách project                 |
| Kanban Board        | Board kéo thả task                |
| Task Detail         | Chi tiết task                     |
| Calendar            | Lịch task theo tuần/tháng/năm     |
| Members             | Quản lý thành viên                |
| Roles & Permissions | Quản lý RBAC                      |
| Workflow Settings   | Quản lý status flow               |
| Notifications       | Danh sách thông báo               |
| Audit Logs          | Lịch sử thay đổi                  |

---

## 7.3. Kanban UI

Mỗi column gồm:

* Tên status.
* Số lượng task.
* WIP limit nếu có.
* Nút tạo task nhanh.
* Danh sách task card.

Task card hiển thị:

* Title.
* Priority.
* Assignee avatar.
* Due date.
* Labels.
* Comment count.
* Checklist progress.
* Overdue indicator.

---

## 7.4. Calendar UI

Calendar cần hỗ trợ:

* Chuyển view: Day / Week / Month / Year.
* Click task để mở task detail.
* Filter theo project.
* Filter theo assignee.
* Filter theo priority.
* Hiển thị màu theo status hoặc priority.
* Drag/drop event để đổi lịch, nếu được phân quyền.

---

# 8. Data Model Draft

## 8.1. app_user

```text
app_user
- id UUID PK
- keycloak_user_id VARCHAR UNIQUE NOT NULL
- email VARCHAR UNIQUE
- username VARCHAR
- display_name VARCHAR
- avatar_url TEXT
- status VARCHAR
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

## 8.2. workspace

```text
workspace
- id UUID PK
- name VARCHAR NOT NULL
- slug VARCHAR UNIQUE NOT NULL
- owner_id UUID FK app_user(id)
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

## 8.3. project

```text
project
- id UUID PK
- workspace_id UUID FK workspace(id)
- name VARCHAR NOT NULL
- key VARCHAR NOT NULL
- description TEXT
- default_workflow_id UUID
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

## 8.4. task

```text
task
- id UUID PK
- workspace_id UUID FK workspace(id)
- project_id UUID FK project(id)
- status_id UUID FK workflow_status(id)
- title VARCHAR NOT NULL
- description TEXT
- priority VARCHAR
- assignee_id UUID FK app_user(id)
- reporter_id UUID FK app_user(id)
- parent_task_id UUID FK task(id)
- start_at TIMESTAMP WITH TIME ZONE
- end_at TIMESTAMP WITH TIME ZONE
- due_at TIMESTAMP WITH TIME ZONE
- completed_at TIMESTAMP WITH TIME ZONE
- timezone VARCHAR
- recurrence_rule TEXT
- recurrence_until TIMESTAMP WITH TIME ZONE
- sort_order BIGINT
- deleted_at TIMESTAMP WITH TIME ZONE
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

---

## 8.5. workflow_status

```text
workflow_status
- id UUID PK
- workflow_id UUID FK workflow(id)
- code VARCHAR NOT NULL
- name VARCHAR NOT NULL
- category VARCHAR
- color VARCHAR
- sort_order INT
- wip_limit INT
- is_terminal BOOLEAN
```

---

## 8.6. workflow_transition

```text
workflow_transition
- id UUID PK
- workflow_id UUID FK workflow(id)
- from_status_id UUID FK workflow_status(id)
- to_status_id UUID FK workflow_status(id)
- name VARCHAR
- require_comment BOOLEAN
- require_assignee BOOLEAN
- sort_order INT
```

---

# 9. MVP Plan

## Phase 1 — Foundation

Mục tiêu: chạy được app với auth đầy đủ.

Bao gồm:

* Setup Spring Boot Java 17.
* Setup Angular + NG-ZORRO.
* Setup Keycloak.
* Login/logout.
* Google login.
* GitHub login.
* Bearer token API.
* API `/api/me`.
* Sync user từ Keycloak vào DB.

---

## Phase 2 — Workspace, Project, RBAC cơ bản

Bao gồm:

* Workspace CRUD.
* Project CRUD.
* Member management.
* Role mặc định.
* Permission check backend.

---

## Phase 3 — Task core

Bao gồm:

* Task CRUD.
* Assign task.
* Priority.
* Label.
* Due date.
* Comment cơ bản.
* Checklist cơ bản.

---

## Phase 4 — Workflow + Kanban

Bao gồm:

* Workflow mặc định.
* Status list.
* Transition validation.
* Kanban board.
* Drag/drop task.
* Sort task trong column.
* Audit log task transition.

---

## Phase 5 — Calendar + Reminder

Bao gồm:

* Week calendar.
* Month calendar.
* Schedule task.
* Recurring task.
* In-app notification.
* Email reminder.

---

## Phase 6 — Admin hoàn chỉnh

Bao gồm:

* Role management.
* Permission management.
* Workflow setting UI.
* Audit log viewer.
* Dashboard.

---

# 10. Open Questions cần bạn xác nhận

Để SPEC từ v0.1 thành v1.0 hoàn chỉnh, cần chốt các điểm sau.

## 10.1. Product scope

1. App này là **todo cá nhân**, **team nội bộ**, hay **SaaS nhiều công ty/workspace**?
2. Có cần nhiều workspace không?
3. Có cần nhiều project trong một workspace không?
4. User có được tự đăng ký không, hay phải admin mời?
5. Có cần guest user cho khách hàng/người ngoài không?

## 10.2. Authentication

6. Login Google/GitHub có tự tạo user ngay không?
7. Có cần admin duyệt user mới không?
8. Có cho phép link nhiều provider vào cùng một account không?
9. Có bắt buộc verify email không?
10. Có cần MFA/2FA không?

## 10.3. RBAC

11. Role là cố định hay admin có thể tự tạo role?
12. Phân quyền đến project là đủ, hay cần đến từng task?
13. Viewer có được comment không?
14. Member có được tạo task không?
15. Assignee có được tự chuyển task sang `DONE` không?

## 10.4. Workflow

16. Mỗi project có workflow riêng không?
17. Status mặc định bạn muốn gồm những trạng thái nào?
18. Có cần approval khi chuyển `REVIEW → DONE` không?
19. Chuyển sang `BLOCKED` có bắt buộc nhập lý do không?
20. Có cần WIP limit cho Kanban column không?

## 10.5. Task

21. Task có cần attachment không?
22. Task có cần comment không?
23. Task có cần checklist/subtask không?
24. Có cần dependency giữa task không?
25. Có cần import/export Excel hoặc CSV không?

## 10.6. Calendar

26. MVP cần week/month thôi hay cần cả day/year?
27. Timezone dùng theo user hay workspace?
28. Recurring task sẽ chỉ hiển thị trên calendar hay tự sinh task mới?
29. Reminder gửi qua email, in-app, web push hay cả ba?
30. Có cần đồng bộ Google Calendar/Outlook không?

## 10.7. Deployment

31. Bạn muốn deploy bằng Docker Compose hay Kubernetes?
32. Database dùng PostgreSQL được không?
33. Có cần Redis không?
34. Có cần CI/CD không?
35. Có cần tách môi trường dev/staging/prod không?

---

# 11. Đề xuất chốt cho bản SPEC v1.0

Mình đề xuất chốt theo hướng sau:

| Hạng mục         | Quyết định đề xuất                       |
| ---------------- | ---------------------------------------- |
| Loại app         | Team workspace app                       |
| Auth             | Keycloak                                 |
| Social login     | Google + GitHub qua Keycloak             |
| Token            | JWT Bearer Token                         |
| Backend          | Spring Boot Java 17                      |
| Frontend         | Angular + NG-ZORRO                       |
| Database         | PostgreSQL                               |
| RBAC             | Role mặc định trong MVP, custom role sau |
| Permission scope | Workspace + Project trong MVP            |
| Workflow         | Configurable, không hard-code            |
| Kanban           | Drag/drop + transition validation        |
| Calendar MVP     | Week + Month                             |
| Recurring task   | RRULE                                    |
| Reminder MVP     | In-app + email                           |
| Deployment MVP   | Docker Compose                           |
| Audit log        | Bắt buộc có                              |

Bản này là **SPEC v0.1**. Sau khi bạn trả lời các câu hỏi ở mục 10, có thể nâng lên **SPEC v1.0** với scope rõ ràng, API đầy đủ, ERD chi tiết và backlog triển khai theo sprint.

# Feature: Task Management

## Description
Task management provides a lightweight tracking entity for daily operational tasks. Each task includes a label, priority, status, and scheduled day, with standard audit metadata.

## Roles
- **ADMIN**: Full access to all tasks, including hard delete
- **COACH**: Manage only tasks they created
- **ATHLETE**: Manage only tasks they created

---

## Scenario: Create a new task

**Given** a coach is authenticated
**When** the coach creates a task:
```json
{
  "label": "Client check-in",
  "priority": "MIDDLE",
  "status": "TODO",
  "day": "2024-05-01T00:00:00.000Z"
}
```

**Then** the system should:
1. Persist the task with `createdBy` set to the authenticated user
2. Set `createdAt` and `updatedAt` timestamps
3. Return the created task

---

## Scenario: Retrieve a task by ID

**Given** a task exists with ID `task-1`
**When** the creator or an admin requests the task
**Then** the system should return the task details

---

## Scenario: List tasks with filters

**Given** multiple tasks exist with varying priorities and statuses
**When** a user lists tasks with filters:
```json
{
  "priority": "HIGH",
  "status": "TODO"
}
```
**Then** the system should return only the matching tasks
**And** non-admin users should see only their own tasks

---

## Scenario: Update a task

**Given** a task exists with ID `task-1`
**When** the creator updates the task:
```json
{
  "id": "task-1",
  "status": "DONE"
}
```
**Then** the system should update the task and refresh `updatedAt`

---

## Scenario: Soft delete a task

**Given** a task exists with ID `task-1`
**When** the creator deletes the task
**Then** the system should set `deletedAt` and return success

---

## Scenario: Hard delete a task (admin only)

**Given** a task exists with ID `task-1`
**When** an admin hard deletes the task
**Then** the system should permanently remove the task

---

## Business Rules

### Task Structure
- **Label**: Required, user-defined
- **Priority**: LOW, MIDDLE, HIGH
- **Status**: TODO, DONE
- **Day**: Date associated with the task

### Ownership & Authorization
- Coaches and athletes can only create, read, list, update, and delete their own tasks
- Admins can manage all tasks
- Hard delete is reserved for admins

---

## CRUD Operations

### Create Task
- **Use Case**: `CreateTaskUsecase`
- **Authorization**: ADMIN, COACH, ATHLETE

### Get Task
- **Use Case**: `GetTaskUsecase`
- **Authorization**: Creator or ADMIN

### List Tasks
- **Use Case**: `ListTasksUsecase`
- **Authorization**: ADMIN, COACH, ATHLETE
- **Filters**: priority, status, day, day range

### Update Task
- **Use Case**: `UpdateTaskUsecase`
- **Authorization**: Creator or ADMIN

### Delete Task (Soft)
- **Use Case**: `DeleteTaskUsecase`
- **Authorization**: Creator or ADMIN

### Hard Delete Task
- **Use Case**: `HardDeleteTaskUsecase`
- **Authorization**: ADMIN only

---

## GraphQL Operations

### Create Task
```graphql
mutation TaskCreate($input: CreateTaskInput!) {
  task_create(input: $input) {
    id
    label
    priority
    status
    day
  }
}
```

### List Tasks
```graphql
query TaskList($input: ListTasksInput) {
  task_list(input: $input) {
    items {
      id
      label
      priority
      status
      day
    }
  }
}
```

---

## Error Codes
- `CREATE_TASK_USECASE` - Failed to create task
- `GET_TASK_USECASE` - Failed to retrieve task
- `LIST_TASKS_USECASE` - Failed to list tasks
- `UPDATE_TASK_USECASE` - Failed to update task
- `DELETE_TASK_USECASE` - Failed to delete task
- `HARD_DELETE_TASK_USECASE` - Failed to hard delete task
- `GET_TASK_FORBIDDEN` - Access denied for task retrieval
- `DELETE_TASK_FORBIDDEN` - Access denied for task deletion
- `HARD_DELETE_TASK_FORBIDDEN` - Access denied for hard delete

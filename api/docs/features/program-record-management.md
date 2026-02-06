# Feature: Program Record Management

## Description
Program records store execution progress for an athlete program (`CREATE`, `DRAFT`, `FINISH`) with optional exercise set details.

## Roles
- **ADMIN**: Full access.
- **COACH**: Create/update/read/list records according to assignment/business constraints.
- **ATHLETE**: Read/list/update own records only.

## Business Rules
- Valid states: `CREATE`, `DRAFT`, `FINISH`.
- A record belongs to one athlete (`userId`) and one program (`programId`).
- Soft delete (`programRecord_delete`) is available to ADMIN/COACH/ATHLETE with ownership checks in use case.
- Hard delete (`programRecord_hardDelete`) is guarded as ADMIN-only at GraphQL layer.

## CRUD Operations
| Operation | GraphQL operation | Use case | Roles |
| --- | --- | --- | --- |
| Create | `programRecord_create` | `CreateProgramRecordUsecase` | ADMIN, COACH, ATHLETE |
| Get | `programRecord_get` | `GetProgramRecordUsecase` | ADMIN, COACH, ATHLETE |
| List | `programRecord_list` | `ListProgramRecordsUsecase` | ADMIN, COACH, ATHLETE |
| Update state/data | `programRecord_updateState` | `UpdateProgramRecordUsecase` | ADMIN, COACH, ATHLETE |
| Soft delete | `programRecord_delete` | `DeleteProgramRecordUsecase` | ADMIN, COACH, ATHLETE |
| Hard delete | `programRecord_hardDelete` | `HardDeleteProgramRecordUsecase` | ADMIN |

## GraphQL Operations

### Create
```graphql
mutation CreateProgramRecord($input: CreateProgramRecordInput!) {
  programRecord_create(input: $input) {
    id
    userId
    programId
    state
    createdAt
    updatedAt
  }
}
```

### Update
```graphql
mutation UpdateProgramRecord($input: UpdateProgramRecordInput!) {
  programRecord_updateState(input: $input) {
    id
    state
    durationMinutes
    difficultyRating
    updatedAt
  }
}
```

### Soft delete
```graphql
mutation DeleteProgramRecord($id: ID!) {
  programRecord_delete(id: $id)
}
```

### Hard delete
```graphql
mutation HardDeleteProgramRecord($id: ID!) {
  programRecord_hardDelete(id: $id)
}
```

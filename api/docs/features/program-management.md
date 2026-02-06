# Feature: Sport Program Management

## Description
Manage training programs composed of session snapshots. This feature exposes create/read/list/update and delete operations with ownership and role-based controls.

## Roles
- **ADMIN**: Full access across all programs.
- **COACH**: Create programs and manage owned programs.
- **ATHLETE**: Read/list only when allowed by assignment and visibility rules.

## Business Rules
- Visibility values are limited to `PUBLIC` and `PRIVATE`.
- Create: `ADMIN` and `COACH`.
- Read/Get and List: `ADMIN`, `COACH`, `ATHLETE`.
- Update: owner or admin.
- Soft delete: owner or admin.
- Hard delete (`program_delete`): admin only (GraphQL guard).

## CRUD Operations
| Operation | GraphQL operation | Use case | Roles |
| --- | --- | --- | --- |
| Create | `program_create` | `CreateProgramUsecase` | ADMIN, COACH |
| Get | `program_get` | `GetProgramUsecase` | ADMIN, COACH, ATHLETE |
| List | `program_list` | `ListProgramsUsecase` | ADMIN, COACH, ATHLETE |
| Update | `program_update` | `UpdateProgramUsecase` | ADMIN, COACH |
| Soft delete | `program_softDelete` | `DeleteProgramUsecase` | ADMIN, COACH |
| Hard delete | `program_delete` | `HardDeleteProgramUsecase` | ADMIN |

## GraphQL Operations

### Create Program
```graphql
mutation ProgramCreate($input: CreateProgramInput!) {
  program_create(input: $input) {
    id
    label
    locale
    description
    duration
    frequency
    visibility
    sessions {
      id
      label
      order
    }
  }
}
```

### Update Program
```graphql
mutation ProgramUpdate($input: UpdateProgramInput!) {
  program_update(input: $input) {
    id
    label
    description
    updatedAt
  }
}
```

### Soft Delete Program
```graphql
mutation ProgramSoftDelete($id: ID!) {
  program_softDelete(id: $id)
}
```

### Hard Delete Program
```graphql
mutation ProgramHardDelete($id: ID!) {
  program_delete(id: $id)
}
```

# Meal Record Management

## Description
Meal records track the execution status of a specific meal inside a meal plan for an athlete. They allow an athlete to start a meal, save it as a draft, and mark it as finished using explicit state transitions.

## Roles
- **Admin**: Can create, read, list, update, and delete meal records for any athlete.
- **Coach**: Can create or update meal records when the meal plan assignment matches the target athlete.
- **Athlete**: Can manage only their own meal records.

## Scenarios

```gherkin
Scenario: Athlete starts a meal record
  Given an athlete is authenticated
  And the meal plan is assigned to the athlete
  And the meal exists in the specified day
  When the athlete creates a meal record with state CREATE
  Then a meal record is stored with the athlete id, meal plan id, and state CREATE
```

```gherkin
Scenario: Athlete saves a meal as draft
  Given an athlete has an existing meal record
  When the athlete updates the record state to DRAFT
  Then the record state becomes DRAFT
```

```gherkin
Scenario: Athlete finishes a meal
  Given an athlete has an existing meal record
  When the athlete updates the record state to FINISH
  Then the record state becomes FINISH
```

```gherkin
Scenario: Athlete cannot modify another athlete's record
  Given an athlete is authenticated
  And a meal record belongs to another athlete
  When the athlete tries to update the record
  Then the system rejects the request
```

## Business Rules
- A meal record is identified by its `id` and references `mealPlanId`, `mealDayId`, and `mealId`.
- Only `CREATE`, `DRAFT`, and `FINISH` states are valid.
- Athletes can only manage records tied to their own user id.
- Records can only be created when the meal plan is accessible to the requester and the meal exists in the referenced day.

## CRUD Operations
| Operation | Use Case | Authorization | Notes |
| --- | --- | --- | --- |
| Create | `CreateMealRecordUsecase` | Admin, Coach, Athlete | Default state is `CREATE` when not provided |
| Read | `GetMealRecordUsecase` | Admin, Athlete (self) | Returns null when not authorized |
| List | `ListMealRecordsUsecase` | Admin, Athlete (self) | Athletes only see their own records |
| Update | `UpdateMealRecordUsecase` | Admin, Creator | Updates the record state |
| Soft Delete | `DeleteMealRecordUsecase` | Admin, Creator | Sets `deletedAt` |
| Hard Delete | `HardDeleteMealRecordUsecase` | Admin, Creator | Removes the record |

## GraphQL Operations

### Mutation: Start a meal record
```graphql
mutation StartMealRecord($input: CreateMealRecordInput!) {
  mealRecord_create(input: $input) {
    id
    userId
    mealPlanId
    mealDayId
    mealId
    state
    createdAt
    updatedAt
  }
}
```

### Mutation: Update record state
```graphql
mutation UpdateMealRecord($input: UpdateMealRecordInput!) {
  mealRecord_updateState(input: $input) {
    id
    state
    updatedAt
  }
}
```

### Mutation: Soft delete record
```graphql
mutation DeleteMealRecord($id: ID!) {
  mealRecord_delete(id: $id)
}
```

### Mutation: Hard delete record
```graphql
mutation HardDeleteMealRecord($id: ID!) {
  mealRecord_hardDelete(id: $id)
}
```

### Query: Get a record
```graphql
query GetMealRecord($id: ID!) {
  mealRecord_get(id: $id) {
    id
    userId
    mealPlanId
    mealDayId
    mealId
    state
  }
}
```

### Query: List records
```graphql
query ListMealRecords($input: ListMealRecordsInput) {
  mealRecord_list(input: $input) {
    items {
      id
      userId
      mealPlanId
      mealDayId
      mealId
      state
    }
    total
    page
    limit
  }
}
```

## Error Codes
- `CREATE_MEAL_RECORD_USECASE`
- `GET_MEAL_RECORD_USECASE`
- `LIST_MEAL_RECORDS_USECASE`
- `UPDATE_MEAL_RECORD_USECASE`
- `DELETE_MEAL_RECORD_USECASE`
- `HARD_DELETE_MEAL_RECORD_USECASE`
- `FORBIDDEN`

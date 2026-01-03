# Program Record Management

## Description
Program records track the execution status of a training program assigned to an athlete. They allow an athlete to start a program, save it as a draft, and mark it as finished using explicit state transitions. Records also persist per-exercise set data (repetitions and load) so athletes can log what they actually performed.

## Roles
- **Admin**: Can create, read, list, and update program records for any athlete.
- **Coach**: Can create or update program records when the program assignment matches the target athlete.
- **Athlete**: Can manage only their own program records.

## Scenarios

```gherkin
Scenario: Athlete starts an assigned program
  Given an athlete is authenticated
  And the program is assigned to the athlete
  When the athlete creates a program record with state CREATE
  Then a program record is stored with the athlete id, program id, and state CREATE
```

```gherkin
Scenario: Athlete saves a program as draft
  Given an athlete has an existing program record
  When the athlete updates the record state to DRAFT
  Then the record state becomes DRAFT
  And the record stores the logged sets for each exercise
```

```gherkin
Scenario: Athlete finishes a program
  Given an athlete has an existing program record
  When the athlete updates the record state to FINISH
  Then the record state becomes FINISH
```

```gherkin
Scenario: Athlete cannot modify another athlete's record
  Given an athlete is authenticated
  And a program record belongs to another athlete
  When the athlete tries to update the record
  Then the system rejects the request
```

## Business Rules
- A program record is uniquely identified by the pair `(userId, programId)`.
- Only `CREATE`, `DRAFT`, and `FINISH` states are valid.
- Athletes can only manage records tied to their own user id.
- Records can only be created when the program is accessible to the requester.
- Record data captures sets per exercise with repetitions, load, done values, plus exercise notes.
- Records can store duration (minutes) and a difficulty rating.

## CRUD Operations
| Operation | Use Case | Authorization | Notes |
| --- | --- | --- | --- |
| Create | `CreateProgramRecordUsecase` | Admin, Coach, Athlete | Default state is `CREATE` when not provided |
| Read | `GetProgramRecordUsecase` | Admin, Athlete (self) | Returns null when not authorized |
| List | `ListProgramRecordsUsecase` | Admin, Athlete (self) | Athletes only see their own records |
| Update | `UpdateProgramRecordUsecase` | Admin, Athlete (self) | Updates the record state and record data |

## GraphQL Operations

### Mutation: Start a program
```graphql
mutation StartProgramRecord($input: CreateProgramRecordInput!) {
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

### Mutation: Update record state
```graphql
mutation UpdateProgramRecord($input: UpdateProgramRecordInput!) {
  programRecord_updateState(input: $input) {
    id
    state
    recordData {
      exercises {
        exerciseId
        notes
        sets {
          index
          repetitions
          charge
          done
        }
      }
    }
    durationMinutes
    difficultyRating
    updatedAt
  }
}
```

### Query: Get a record
```graphql
query GetProgramRecord($id: ID!) {
  programRecord_get(id: $id) {
    id
    userId
    programId
    state
  }
}
```

### Query: List records
```graphql
query ListProgramRecords($input: ListProgramRecordsInput) {
  programRecord_list(input: $input) {
    items {
      id
      userId
      programId
      state
    }
    total
    page
    limit
  }
}
```

## Error Codes
- `CREATE_PROGRAM_RECORD_USECASE`
- `GET_PROGRAM_RECORD_USECASE`
- `LIST_PROGRAM_RECORDS_USECASE`
- `UPDATE_PROGRAM_RECORD_USECASE`
- `FORBIDDEN`

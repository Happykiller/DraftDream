# Feature: Coach-Athlete Management

## Description
The coach-athlete management feature allows coaches to establish and manage relationships with their athletes. This includes creating links between coaches and athletes, setting active periods, tracking notes, and managing the lifecycle of the coaching relationship.

## Roles
- **COACH**: Can manage their athlete relationships
- **ADMIN**: Can manage all coach-athlete relationships
- **ATHLETE**: Can view their assigned coaches

---

## Scenario: Create a new coach-athlete link

**Given** a coach exists with ID `coach-1`
**And** an athlete exists with ID `athlete-1`

**When** a coach creates a new relationship:
```json
{
  "coachId": "coach-1",
  "athleteId": "athlete-1",
  "startDate": "2024-01-01",
  "is_active": true,
  "createdBy": "user-1"
}
```

**Then** the system should create the link.

---

## Scenario: Update a coach-athlete link

**Given** a link exists with ID `link-1`

**When** a coach updates the link:
```json
{
  "id": "link-1",
  "startDate": "2024-02-01",
  "endDate": "2024-06-30",
  "note": "Updated notes",
  "is_active": false
}
```

**Then** the system should update the specified fields (including start/end dates, active status, notes, coach/athlete IDs if provided).

---

## Scenario: Delete a coach-athlete link

**Given** a link exists with ID `link-1`

**When** an admin or coach deletes the link

**Then** the system should soft-delete the link (mark as deleted).

---

## Business Rules

### Link Uniqueness
- A coach can have multiple athletes
- An athlete can have multiple coaches

### Audit Trail
- `createdBy`: User who created the link
- `createdAt`: When link was created
- `updatedAt`: Last modification timestamp
- `deletedAt`: Timestamp of deletion (soft delete)

---

## CRUD Operations

### Create Link
- **Use Case**: `CreateCoachAthleteUsecase`
- **Authorization**: COACH (own links), ADMIN

### Get Link
- **Use Case**: `GetCoachAthleteUsecase`
- **Authorization**: Related COACH, related ATHLETE, ADMIN

### List Links
- **Use Case**: `ListCoachAthletesUsecase`
- **Authorization**: COACH (own links), ADMIN (all)

### Update Link
- **Use Case**: `UpdateCoachAthleteUsecase`
- **Authorization**: Related COACH, ADMIN
- **Fields**: coachId, athleteId, startDate, endDate, note, is_active

### Delete Link
- **Use Case**: `DeleteCoachAthleteUsecase`
- **Authorization**: Related COACH, ADMIN
- **Type**: Soft delete

---

## GraphQL Operations

### Create Coach-Athlete Link
```graphql
mutation CoachAthleteCreate($input: CreateCoachAthleteInput!) {
  coach_athlete_create(input: $input) {
    id
    coachId
    athleteId
    startDate
    endDate
    note
    is_active
    createdAt
    updatedAt
  }
}
```

### List Coach's Athletes
```graphql
query CoachAthleteList($coachId: ID!, $is_active: Boolean) {
  coach_athlete_list(coachId: $coachId, is_active: $is_active) {
    items {
        id
        athleteId
        startDate
        endDate
        is_active
    }
  }
}
```

### Update Link
```graphql
mutation CoachAthleteUpdate($id: ID!, $input: UpdateCoachAthleteInput!) {
  coach_athlete_update(id: $id, input: $input) {
    id
    endDate
    note
    is_active
    updatedAt
  }
}
```

---

## Error Codes
- `CREATE_COACH_ATHLETE_USECASE`
- `GET_COACH_ATHLETE_USECASE`
- `UPDATE_COACH_ATHLETE_USECASE`
- `DELETE_COACH_ATHLETE_USECASE`
- `COACH_NOT_FOUND`
- `ATHLETE_NOT_FOUND`
- `LINK_NOT_FOUND`

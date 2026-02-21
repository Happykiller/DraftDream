# Feature: Coach-Athlete Management

## Description
The coach-athlete management feature allows coaches to establish and manage relationships with their athletes. This includes creating links between coaches and athletes, setting active periods, tracking notes, and managing the lifecycle of the coaching relationship.

The feature also exposes a KPI summary endpoint for coaches and admins so they can retrieve athlete mental KPI snapshots computed from daily reports.

## Roles
- **COACH**: Can manage their athlete relationships and access KPI summary only for athletes with an active link
- **ADMIN**: Can manage all coach-athlete relationships and access KPI summary for any athlete
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

## Scenario: Get athlete KPI summary as coach

**Given** a coach is authenticated
**And** an athlete exists with ID `athlete-1`
**And** an active coach-athlete link exists for this pair at current date

**When** the coach requests `GET /coach/athletes/athlete-1/kpi-summary`

**Then** the API should return a KPI summary payload containing the `mental` KPI.

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

### Active Link Filtering (for Coaches)
When a **COACH** queries their athlete links, the system automatically filters to show only "active" relationships based on the current date (`activeAt`). A link is considered active if:

**Start Date Rules:**
- `startDate` is missing/undefined, OR
- `startDate` is explicitly `null`, OR
- `startDate` is less than or equal to the current date

**End Date Rules:**
- `endDate` is missing/undefined, OR
- `endDate` is explicitly `null` (no end date = ongoing relationship), OR
- `endDate` is greater than or equal to the current date

**Note**: Admins bypass this filter and can see all links regardless of dates when using the `includeArchived` parameter.

### Coach visibility resolution (shared usecase)
The coach-athlete visibility check is centralized in `ResolveCoachAthleteVisibilityUsecase` to avoid duplicated date and active-link checks.

### Mental KPI computation
The mental KPI is computed from the latest 10 daily reports:
- `base = (energyLevel + motivationLevel + (10 - stressLevel)) / 3`
- `score = base * 10`
- Mood adjustment:
  - `+5` if `moodLevel >= 7`
  - `0` if `moodLevel` is between `4` and `6`
  - `-5` if `moodLevel <= 3`
- Additional `-5` if `disruptiveFactor = true`
- Clamp each report score to `[0, 100]`
- Final KPI returns the rounded average score and sample size

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
- **Filtering**:
  - **COACH**: Automatically filtered by `activeAt` (current date) to show only active relationships
  - **ADMIN**: Can use `includeArchived` parameter to control filtering
- **Search**: Supports searching by athlete name/email (via `q` parameter) and filtering by `is_active` status

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

## REST Operations

### Get Athlete KPI Summary
- **Endpoint**: `GET /coach/athletes/:id/kpi-summary`
- **Authorization**:
  - `ADMIN`: always allowed
  - `COACH`: allowed only if coach-athlete active link exists at request date
- **Response**:
```json
{
  "mental": {
    "score": 74,
    "sampleSize": 10
  }
}
```

---

## Error Codes
- `CREATE_COACH_ATHLETE_USECASE`
- `GET_COACH_ATHLETE_USECASE`
- `UPDATE_COACH_ATHLETE_USECASE`
- `DELETE_COACH_ATHLETE_USECASE`
- `GET_ATHLETE_KPI_SUMMARY_USECASE`
- `COACH_NOT_FOUND`
- `ATHLETE_NOT_FOUND`
- `LINK_NOT_FOUND`

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
**And** no existing active link between these coach and athlete

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

**Then** the system should:
1. Validate that both coach and athlete exist
2. Create the coach-athlete link in the database
3. Generate a unique link ID
4. Set creation and update timestamps
5. Return the created link

**And** the response should contain:
```json
{
  "id": "link-1",
  "coachId": "coach-1",
  "athleteId": "athlete-1",
  "startDate": "2024-01-01T00:00:00.000Z",
  "is_active": true,
  "createdBy": "user-1",
  "createdAt": "<TIMESTAMP>",
  "updatedAt": "<TIMESTAMP>"
}
```

---

## Scenario: Create link with optional fields

**Given** a coach with ID `coach-1` and athlete with ID `athlete-1`

**When** a coach creates a relationship with optional fields:
```json
{
  "coachId": "coach-1",
  "athleteId": "athlete-1",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "note": "Focus on strength training",
  "is_active": true,
  "createdBy": "coach-1"
}
```

**Then** the system should:
1. Create the link with all provided fields
2. Store the end date and note
3. Return the complete link with all fields

**And** the note should be available for the coach to reference

---

## Scenario: Create link fails - Database error

**Given** valid coach and athlete IDs
**And** the database encounters an error during creation

**When** a coach attempts to create a relationship

**Then** the system should:
1. Attempt to create the link
2. Encounter database error
3. Log the error: `CreateCoachAthleteUsecase#execute => DB Error`
4. Throw error: `CREATE_COACH_ATHLETE_USECASE`

**And** no link should be persisted

---

## Scenario: Create link returns null

**Given** valid coach and athlete IDs
**And** the repository returns `null` (creation failed without error)

**When** a coach attempts to create a relationship

**Then** the system should:
1. Attempt to create the link
2. Receive `null` from repository
3. Return `null` to caller

**And** no link should be created

---

## Scenario: Retrieve a coach-athlete link

**Given** a coach-athlete link exists with ID `link-1`

**When** the system retrieves the link by ID `link-1`

**Then** the system should:
1. Query the database for the link
2. Return all link details

**And** the response should include:
- Link ID
- Coach ID
- Athlete ID  
- Start date
- End date (if set)
- Active status
- Note (if set)
- Audit fields

---

## Scenario: List all athletes for a coach

**Given** a coach exists with ID `coach-1`
**And** the coach has the following athlete links:
  - Link to `athlete-1` (active)
  - Link to `athlete-2` (active)
  - Link to `athlete-3` (inactive)

**When** the coach requests their athlete list with filter `is_active: true`

**Then** the system should:
1. Query links where `coachId = "coach-1"`
2. Filter by `is_active = true`
3. Return the list of active links

**And** the response should contain 2 links (athlete-1 and athlete-2)

---

## Scenario: Update a coach-athlete link

**Given** a link exists with ID `link-1`
**And** the link is currently active

**When** a coach updates the link:
```json
{
  "id": "link-1",
  "endDate": "2024-06-30",
  "note": "Updated: athlete completed program",
  "is_active": false
}
```

**Then** the system should:
1. Retrieve the existing link
2. Update the specified fields
3. Update the `updatedAt` timestamp
4. Return the updated link

**And** the link should now be marked inactive with end date set

---

## Scenario: Delete a coach-athlete link

**Given** a link exists with ID `link-1`
**And** the link connects `coach-1` and `athlete-1`

**When** an admin or coach deletes the link

**Then** the system should:
1. Find the link in database
2. Remove the link permanently
3. Return success confirmation

**And** the relationship should no longer exist

---

## Business Rules

### Link Uniqueness
- A coach can have multiple athletes
- An athlete can have multiple coaches
- Multiple links between same coach-athlete pair should be managed carefully
- Consider using `is_active` flag to track current vs historical relationships

### Active Period
- `startDate`: When the coaching relationship begins (required)
- `endDate`: When the relationship ends (optional, null = ongoing)
- `is_active`: Boolean flag for current status

### Notes
- Free text field for coach to track important information
- Can be updated at any time
- Private to the coach and system admins

### Audit Trail
- `createdBy`: User who created the link
- `createdAt`: When link was created
- `updatedAt`: Last modification timestamp

### Authorization
- Coaches can only manage their own athlete relationships
- Admins can manage all relationships
- Athletes have read-only access to their coach links

---

## CRUD Operations

### Create Link
- **Use Case**: `CreateCoachAthleteUsecase`
- **Authorization**: COACH (own links), ADMIN
- **Validation**: Coach and athlete must exist

### Get Link
- **Use Case**: `GetCoachAthleteUsecase`
- **Authorization**: Related COACH, related ATHLETE, ADMIN
- **Returns**: Complete link details

### List Links
- **Use Case**: `ListCoachAthletesUsecase`
- **Authorization**: COACH (own links), ADMIN (all)
- **Filters**: By coach, by athlete, by active status, date range

### Update Link
- **Use Case**: `UpdateCoachAthleteUsecase`
- **Authorization**: Related COACH, ADMIN
- **Fields**: end_date, note, is_active

### Delete Link
- **Use Case**: `DeleteCoachAthleteUsecase`
- **Authorization**: Related COACH, ADMIN
- **Type**: Hard delete (permanent removal)

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
- `CREATE_COACH_ATHLETE_USECASE` - Failed to create coach-athlete link
- `GET_COACH_ATHLETE_USECASE` - Failed to retrieve link
- `UPDATE_COACH_ATHLETE_USECASE` - Failed to update link
- `DELETE_COACH_ATHLETE_USECASE` - Failed to delete link
- `COACH_NOT_FOUND` - Coach does not exist
- `ATHLETE_NOT_FOUND` - Athlete does not exist
- `LINK_NOT_FOUND` - Coach-athlete link does not exist

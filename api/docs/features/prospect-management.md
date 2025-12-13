# Feature: Prospect Management

## Description
The prospect management feature allows coaches to track detailed information about their potential clients (prospects). This includes prospect profiles, fitness goals, activity preferences, fitness levels, and lead sources.

## Roles
- **ADMIN**: Full access to all prospect data
- **COACH**: Can manage their own prospects

---

## Domain: Prospect Profiles

### Scenario: Create a prospect profile

**Given** a coach is authenticated

**When** the coach creates a prospect:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+123456789",
  "status": "NEW",
  "levelId": "level-1",
  "objectiveIds": ["objective-1"],
  "activityPreferenceIds": ["pref-1"],
  "medicalConditions": "None",
  "allergies": "Peanuts",
  "notes": "Interested in weight loss",
  "sourceId": "source-1",
  "budget": 500,
  "dealDescription": "Package A",
  "desiredStartDate": "2024-02-01",
  "createdBy": "coach-1"
}
```

**Then** the system should:
1. Create the prospect profile
2. Return the created prospect

### Scenario: Update a prospect profile

**Given** a prospect exists with ID `prospect-1`

**When** the coach updates the prospect:
```json
{
  "id": "prospect-1",
  "status": "QUALIFIED",
  "budget": 600
}
```

**Then** the system should update the fields and return the updated prospect

### Scenario: Convert a prospect to an athlete account

**Given** a coach owns a prospect with email `prospect@example.com`

**When** the coach triggers the conversion:
```graphql
mutation ConvertProspect($input: ConvertProspectInput!) {
  prospect_convert(input: $input) {
    prospect {
      id
      status
    }
    athlete {
      id
      email
      type
    }
    coachAthleteLink {
      id
      coachId
      athleteId
      is_active
    }
    createdAthlete
    createdCoachAthleteLink
  }
}
```

**Then** the system should:
1. Create an athlete account when no athlete exists for the prospect email (a temporary password is logged for retrieval).
2. Link the athlete to the owning coach, reactivating an existing inactive link when needed.
3. Update the prospect status to `CLIENT`.

---

## Domain: Prospect Objectives

### Scenario: Create a prospect objective

**Given** a coach creates an objective

**When** the coach sends:
```json
{
  "label": "Weight Loss",
  "locale": "en",
  "visibility": "PUBLIC",
  "createdBy": "coach-1"
}
```

**Then** the system should create the objective with a generated slug `weight-loss`.

---

## Domain: Activity Preferences

### Scenario: Create prospect activity preferences

**Given** a coach creates a preference

**When** the coach sends:
```json
{
  "label": "Running",
  "locale": "en",
  "visibility": "PUBLIC",
  "createdBy": "coach-1"
}
```

**Then** the system should create the preference with slug `running`.

---

## Domain: Prospect Levels

### Scenario: Create prospect fitness level

**Given** a coach creates a level

**When** the coach sends:
```json
{
  "label": "Intermediate",
  "locale": "en",
  "visibility": "PUBLIC",
  "createdBy": "coach-1"
}
```

**Then** the system should create the level with slug `intermediate`.

---

## Domain: Prospect Sources

### Scenario: Create prospect source

**Given** a coach creates a source

**When** the coach sends:
```json
{
  "label": "Instagram",
  "locale": "en",
  "visibility": "PUBLIC",
  "createdBy": "coach-1"
}
```

**Then** the system should create the source with slug `instagram`.

---

## Business Rules

### Prospect Profiles
- Comprehensive profile including contact info, medical info, and deal details.
- Status tracking (NEW, QUALIFIED, etc.).
- Linked to Level, Objectives, Preferences, Source.

### Sub-Domains (Objectives, Levels, Preferences, Sources)
- **Label**: Display name.
- **Slug**: Auto-generated.
- **Locale**: Language support.
- **Visibility**: PUBLIC or PRIVATE.

---

## CRUD Operations

### Prospect Profile
- **Create**: `CreateProspectUsecase`
- **Update**: `UpdateProspectUsecase`
- **List**: `ListProspectsUsecase`
- **Get**: `GetProspectUsecase`
- **Delete**: `DeleteProspectUsecase`

### Sub-Domains (Objective, Level, ActivityPreference, Source)
- **Create**: `Create...Usecase`
- **Update**: `Update...Usecase`
- **List**: `List...Usecase`
- **Get**: `Get...Usecase`
- **Delete**: `Delete...Usecase`

---

## GraphQL Operations

### Create Prospect
```graphql
mutation CreateProspect($input: CreateProspectInput!) {
  prospect_create(input: $input) {
    id
    firstName
    lastName
    email
    status
  }
}
```

### Create Prospect Objective
```graphql
mutation CreateProspectObjective($input: CreateProspectObjectiveInput!) {
  prospect_objective_create(input: $input) {
    id
    label
    slug
    visibility
  }
}
```

---

## Error Codes
- `CREATE_PROSPECT_USECASE`
- `UPDATE_PROSPECT_USECASE`
- `DELETE_PROSPECT_USECASE`
- `PROSPECT_NOT_FOUND`
- ... (Similar codes for sub-domains)

# Feature: Sport Program Management

## Description
The sport program management feature allows coaches and admins to create, organize, and manage training programs. Programs consist of multiple sessions containing exercises, with support for localization, categorization, and detailed program metadata.

## Roles
- **ADMIN**: Full access to all programs
- **COACH**: Can create and manage own programs
- **ATHLETE**: Can view assigned programs

---

## Scenario: Create a new training program

**Given** a coach is authenticated with ID `coach-1`
**And** sessions exist with the following details:
  - Session 1: "Upper Body Strength" 
  - Session 2: "Lower Body Power"

**When** the coach creates a new program:
```json
{
  "label": "Full Body Transformation",
  "locale": "fr",
  "description": "Complete 12-week transformation program",
  "is_active": true,
  "weeks": 12,
  "difficulty": "intermediate",
  "sessions": [
    {
      "label": "Upper Body Strength",
      "description": "Focus on chest, back, shoulders",
      "order": 1
    },
    {
      "label": "Lower Body Power",
      "description": "Legs and glutes development",
      "order": 2
    }
  ],
  "createdBy": "coach-1"
}
```

**Then** the system should:
1. Generate a slug from the label: `full-body-transformation`
2. Generate slugs for each session
3. Create the program with all sessions
4. Set creation timestamps
5. Return the complete program structure

**And** the response should include:
```json
{
  "id": "<PROGRAM_ID>",
  "label": "Full Body Transformation",
  "slug": "full-body-transformation",
  "locale": "fr",
  "description": "Complete 12-week transformation program",
  "weeks": 12,
  "difficulty": "intermediate",
  "is_active": true,
  "sessions": [
    {
      "id": "<SESSION_ID_1>",
      "label": "Upper Body Strength",
      "slug": "upper-body-strength",
      "order": 1
    },
    {
      "id": "<SESSION_ID_2>",
      "label": "Lower Body Power",
      "slug": "lower-body-power",
      "order": 2
    }
  ],
  "createdBy": "coach-1",
  "createdAt": "<TIMESTAMP>"
}
```

---

## Scenario: Create program with auto-generated slug

**Given** a coach creates a program with label "Programme de Force"

**When** the system processes the creation

**Then** the slug should be automatically generated as: `programme-de-force`

**And** special characters and spaces should be converted to hyphens

**And** the slug should be lowercase

---

## Scenario: Create program fails - Duplicate slug and locale

**Given** a program exists with:
  - Slug: `beginner-program`
  - Locale: `fr`
  - Status: Active

**When** a coach attempts to create another program with:
  - Label: "Beginner Program" (generates slug `beginner-program`)
  - Locale: `fr`

**Then** the system should:
1. Attempt to create the program
2. Detect duplicate slug-locale combination
3. Return `null` (creation failed)

**And** no duplicate program should be created

---

## Scenario: Create program fails - System error

**Given** valid program data
**And** the database encounters an error

**When** a coach attempts to create a program

**Then** the system should:
1. Attempt to create the program
2. Encounter system error
3. Log the error: `CreateProgramUsecase#execute => <error>`
4. Throw error: `CREATE_PROGRAM_USECASE`

**And** no program should be persisted

---

## Scenario: Retrieve a program with all details

**Given** a program exists with ID `program-1`
**And** the program has 3 sessions
**And** each session has multiple exercises

**When** a user retrieves the program by ID

**Then** the system should:
1. Query the program by ID
2. Include all nested sessions
3. Include exercise details for each session
4. Include muscle groups, equipment, categories
5. Return the complete program structure

**And** the response should be hydrated with:
- Session details
- Exercise information
- Muscle groups targeted
- Equipment required
- Categories and tags

---

## Scenario: List programs with filters

**Given** multiple programs exist:
  - Program A: locale=`fr`, active=true, difficulty=`beginner`
  - Program B: locale=`en`, active=true, difficulty=`advanced`
  - Program C: locale=`fr`, active=false, difficulty=`intermediate`

**When** a user requests programs with filters:
```json
{
  "locale": "fr",
  "is_active": true,
  "difficulty": "beginner"
}
```

**Then** the system should:
1. Query programs matching all filters
2. Return only Program A
3. Exclude inactive programs
4. Exclude programs in other locales

**And** the result set should contain 1 program

---

## Scenario: Update a program

**Given** a program exists with ID `program-1`
**And** the program has label "Beginner Program"

**When** a coach updates the program:
```json
{
  "id": "program-1",
  "label": "Advanced Beginner Program",
  "weeks": 16,
  "difficulty": "intermediate"
}
```

**Then** the system should:
1. Regenerate slug from new label: `advanced-beginner-program`
2. Update specified fields
3. Update the `updatedAt` timestamp
4. Keep unchanged fields as-is
5. Return the updated program

**And** existing sessions should remain unchanged

---

## Scenario: Delete a program

**Given** a program exists with ID `program-1`
**And** the program has associated sessions

**When** an admin deletes the program

**Then** the system should:
1. Find the program in database
2. Handle cascade delete of sessions (or mark inactive)
3. Remove the program
4. Return success confirmation

**And** the program should no longer be accessible

---

## Business Rules

### Slug Generation
- Slug is auto-generated from label using `buildSlug()` utility
- Converts to lowercase, replaces spaces and special chars with hyphens
- Fallback slug is `program` if label is empty
- Slug + locale combination must be unique for active programs

### Program Structure
- **Label**: Display name (required)
- **Slug**: URL-friendly identifier (auto-generated)
- **Locale**: Language (en, fr, etc.)
- **Description**: Detailed program overview
- **Weeks**: Program duration
- **Difficulty**: beginner, intermediate, advanced
- **Sessions**: Ordered list of training sessions

### Localization
- Programs are locale-specific
- Same program can exist in multiple locales
- Slug uniqueness is enforced per locale

### Active Status
- `is_active`: Controls program visibility
- Inactive programs are hidden from athletes
- Admins can see all programs regardless of status

### Sessions
- Each session has its own slug (auto-generated)
- Sessions are ordered within a program
- Sessions contain exercises with reps, sets, rest periods

---

## CRUD Operations

### Create Program
- **Use Case**: `CreateProgramUsecase`
- **Authorization**: COACH (own), ADMIN
- **Auto-generation**: Slug for program and nested sessions
- **Returns**: Complete program or null if duplicate

### Get Program  
- **Use Case**: `GetProgramUsecase`
- **Authorization**: ALL roles
- **Hydration**: Includes sessions, exercises, equipment, muscles
- **Returns**: Fully populated program object

### List Programs
- **Use Case**: `ListProgramsUsecase`
- **Authorization**: ALL roles
- **Filters**: locale, is_active, difficulty, created_by, date range
- **Returns**: Array of programs with optional pagination

### Update Program
- **Use Case**: `UpdateProgramUsecase`
- **Authorization**: Owner COACH, ADMIN
- **Slug Update**: Re-generated if label changes
- **Returns**: Updated program

### Delete Program
- **Use Case**: `DeleteProgramUsecase`
- **Authorization**: Owner COACH, ADMIN
- **Type**: Hard delete or soft delete (set is_active=false)

---

## GraphQL Operations

### Create Program
```graphql
mutation ProgramCreate($input: CreateProgramInput!) {
  program_create(input: $input) {
    id
    label
    slug
    locale
    description
    weeks
    difficulty
    sessions {
      id
      label
      slug
      order
    }
    is_active
    createdAt
  }
}
```

### Get Program
```graphql
query ProgramGet($id: ID!) {
  program_get(id: $id) {
    id
    label
    slug
    description
    weeks
    difficulty
    sessions {
      id
      label
      exercises {
        id
        label
        reps
        sets
        equipment {
          label
        }
      }
    }
  }
}
```

### List Programs
```graphql
query ProgramList($input: ListProgramsInput) {
  program_list(input: $input) {
    items {
      id
      label
      slug
      weeks
      difficulty
      createdAt
    }
    total
    page
    limit
  }
}
```

---

## Related Features

### Sessions
- Programs contain multiple sessions
- See `session-management.md` for session details

### Exercises
- Sessions contain exercises
- See `exercise-management.md` for exercise details

### Categories & Tags
- Programs can be categorized and tagged
- Enables filtering and search

---

## Error Codes
- `CREATE_PROGRAM_USECASE` - Failed to create program
- `GET_PROGRAM_USECASE` - Failed to retrieve program
- `UPDATE_PROGRAM_USECASE` - Failed to update program
- `DELETE_PROGRAM_USECASE` - Failed to delete program
- `PROGRAM_NOT_FOUND` - Program does not exist
- `DUPLICATE_PROGRAM_SLUG` - Slug/locale combination already exists

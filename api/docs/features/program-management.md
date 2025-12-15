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

**When** the coach creates a new program:
```json
{
  "label": "Full Body Transformation",
  "locale": "fr",
  "description": "Complete 12-week transformation program",
  "visibility": "PUBLIC",
  "duration": 12,
  "frequency": 3,
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
4. Return the complete program structure

---

## Scenario: Create program with auto-generated slug

**Given** a coach creates a program with label "Programme de Force"

**When** the system processes the creation

**Then** the slug should be automatically generated as: `programme-de-force`

---

## Scenario: List programs with filters

**Given** multiple programs exist:
  - Program A: locale=`fr`, visibility=`PUBLIC`
  - Program B: locale=`en`, visibility=`PUBLIC`
  - Program C: locale=`fr`, visibility=`PRIVATE`

**When** a user requests programs with filters:
```json
{
  "locale": "fr",
  "visibility": "PUBLIC"
}
```

**Then** the system should return only Program A.

---

## Business Rules

### Slug Generation
- Slug is auto-generated from label using `buildSlug()` utility.
- Must be unique per locale.

### Program Structure
- **Label**: Display name (required).
- **Slug**: URL-friendly identifier.
- **Locale**: Language (en, fr, etc.).
- **Duration**: Duration value.
- **Frequency**: Frequency value.
- **Visibility**: PUBLIC or PRIVATE.

### Localization
- Programs are locale-specific.

---

## CRUD Operations

### Create Program
- **Use Case**: `CreateProgramUsecase`
- **Authorization**: COACH (own), ADMIN

### Get Program  
- **Use Case**: `GetProgramUsecase`
- **Authorization**: ALL roles

### List Programs
- **Use Case**: `ListProgramsUsecase`
- **Authorization**: ALL roles

### Update Program
- **Use Case**: `UpdateProgramUsecase`
- **Authorization**: Owner COACH, ADMIN

### Delete Program
- **Use Case**: `DeleteProgramUsecase`
- **Authorization**: Owner COACH, ADMIN

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
    duration
    frequency
    sessions {
      id
      label
      slug
      order
    }
    visibility
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
    duration
    frequency
    visibility
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
      duration
      frequency
      visibility
    }
  }
}
```

---

## Related Features

### Sessions
- Programs contain multiple sessions.

### Exercises
- Sessions contain exercises.

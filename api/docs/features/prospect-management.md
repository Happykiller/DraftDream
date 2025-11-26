# Feature: Prospect Management

## Description
The prospect management feature allows coaches to track detailed information about their potential clients (prospects). This includes fitness goals, activity preferences, fitness levels, lead sources, and account status tracking for business insights.

## Roles
- **ADMIN**: Full access to all prospect data
- **COACH**: Can manage their own prospects

---

## Domain: Prospect Objectives

### Scenario: Create a prospect objective

**Given** a prospect exists with ID `prospect-1`
**And** the prospect is working with coach `coach-1`

**When** the coach creates an objective:
```json
{
  "label": "Weight Loss",
  "description": "Lose 10kg in 3 months",
  "targetValue": 10,
  "unit": "kg",
  "targetDate": "2024-04-01",
  "is_active": true,
  "createdBy": "coach-1"
}
```

**Then** the system should:
1. Generate slug from label: `weight-loss`
2. Create the objective
3. Set creation timestamps
4. Return the created objective

**And** the coach can track progress toward this goal

---

## Domain: Activity Preferences

### Scenario: Record prospect activity preferences

**Given** a prospect profile exists
**And** the prospect is filling out their onboarding questionnaire

**When** the prospect selects their preferences:
```json
{
  "label": "Running",
  "preferenceLevel": "high",
  "frequency_per_week": 3,
  "notes": "Prefers outdoor running",
  "is_active": true,
  "createdBy": "prospect-1"
}
```

**Then** the system should:
1. Store the activity preference
2. Generate slug: `running`
3. Associate with prospect profile
4. Enable preference-based program recommendations

---

## Domain: Prospect Levels

### Scenario: Assess prospect fitness level

**Given** a new prospect has completed their fitness assessment
**And** the coach evaluated their capabilities

**When** the coach sets the prospect level:
```json
{
  "label": "Intermediate",
  "description": "Has 6-12 months training experience",
  "assessmentDate": "2024-01-15",
  "is_active": true,
  "createdBy": "coach-1"
}
```

**Then** the system should:
1. Record the fitness level
2. Generate slug: `intermediate`
3. Use for program difficulty matching
4. Track level progression over time

---

## Domain: Prospect Sources

### Scenario: Track prospect acquisition source

**Given** a new prospect is onboarding
**And** the prospect came from a marketing campaign

**When** the source is recorded:
```json
{
  "label": "Instagram Ad - January",
  "channel": "social_media",
  "campaign": "new_year_transformation",
  "referralCode": "NY2024",
  "is_active": true,
  "createdBy": "admin-1"
}
```

**Then** the system should:
1. Record the acquisition source
2. Generate slug: `instagram-ad-january`
3. Enable marketing ROI analysis
4. Track conversion rates by source

---

## Scenario: List prospects with multiple filters

**Given** multiple prospects exist:
  - Prospect A: level=beginner, status=active, objective=weight-loss
  - Prospect B: level=advanced, status=inactive, objective=muscle-gain
  - Prospect C: level=beginner, status=active, objective=general-fitness

**When** a coach requests prospects with filters:
```json
{
  "level": "beginner",
  "status": "active",
  "coachId": "coach-1"
}
```

**Then** the system should:
1. Filter by fitness level
2. Filter by active status
3. Filter by assigned coach
4. Return Prospects A and C

**And** inactive prospects should be excluded

---

## Business Rules

### Prospect Profiles
- Extends base User entity with fitness-specific data
- One prospect profile per user
- Managed primarily by assigned coach

### Objectives
- **Slug**: Auto-generated from label
- **Types**: Weight loss, muscle gain, strength, endurance, general fitness
- **Tracking**: Target value, unit, target date
- **Multiple**: Prospects can have multiple objectives
- **Active**: Only one active objective per type recommended

### Activity Preferences
- **Preference Levels**: none, low, medium, high
- **Frequency**: Sessions per week
- **Purpose**: Guide program recommendations
- **Updates**: Can change as prospect preferences evolve

### Fitness Levels
- **Standard Levels**: Beginner, intermediate, advanced, elite
- **Assessment**: Based on coach evaluation and performance
- **Progression**: Should be updated as prospect improves
- **Impact**: Affects program difficulty and exercise selection

### Source Tracking
- **Channels**: Organic, referral, paid ads, social media, etc.
- **Campaign**: Specific marketing campaign identifier
- **Attribution**: First-touch attribution model
- **Analytics**: Enable ROI calculation and campaign optimization

---

## CRUD Operations (Each Sub-Domain)

### Create
- **Authorization**: COACH (own prospects), ADMIN
- **Validation**: Prospect exists, slug uniqueness per locale
- **Auto-generation**: Slug from label

### Get
- **Authorization**: COACH (own prospects), ADMIN
- **Returns**: Complete entity details

### List
- **Authorization**: COACH (own prospects), ADMIN (all)
- **Filters**: By prospect, by type, by status, date range
- **Sorting**: By date, label, preference level

### Update
- **Authorization**: COACH (own prospects), ADMIN
- **Slug Update**: Regenerated if label changes
- **Partial**: Only specified fields updated

### Delete
- **Authorization**: COACH (own prospects), ADMIN
- **Type**: Soft delete (mark inactive) recommended

---

## GraphQL Operations

### Create Prospect Objective
```graphql
mutation CreateProspectObjective($input: CreateProspectObjectiveInput!) {
  prospect_objective_create(input: $input) {
    id
    label
    slug
    targetValue
    unit
    targetDate
    is_active
  }
}
```

### List Prospect Preferences
```graphql
query ListProspectPreferences($prospectId: ID!) {
  prospect_activity_preference_list(prospectId: $prospectId) {
    items {
        id
        label
        preferenceLevel
        frequency_per_week
    }
  }
}
```

### Update Prospect Level
```graphql
mutation UpdateProspectLevel($input: UpdateProspectLevelInput!) {
  prospect_level_update(input: $input) {
    id
    label
    assessmentDate
    updatedAt
  }
}
```

---

## Reporting & Analytics

### Prospect Segmentation
- By fitness level (beginner/intermediate/advanced)
- By activity preferences
- By objectives
- By acquisition source
- By status

### Retention Metrics
- Active vs inactive prospects
- Churn rate by segment
- Status transition analysis
- Reactivation rates

### Marketing Attribution
- Prospects by source
- Conversion rates by channel
- Campaign performance
- ROI by marketing spend

---

## Error Codes

### Objectives
- `CREATE_PROSPECT_OBJECTIVE_USECASE` - Failed to create objective
- `UPDATE_PROSPECT_OBJECTIVE_USECASE` - Failed to update objective
- `DELETE_PROSPECT_OBJECTIVE_USECASE` - Failed to delete objective
- `OBJECTIVE_NOT_FOUND` - Objective does not exist

### Activity Preferences
- `CREATE_PROSPECT_ACTIVITY_PREFERENCE_USECASE` - Failed to create preference
- `UPDATE_PROSPECT_ACTIVITY_PREFERENCE_USECASE` - Failed to update preference
- `DELETE_PROSPECT_ACTIVITY_PREFERENCE_USECASE` - Failed to delete preference

### Levels
- `CREATE_PROSPECT_LEVEL_USECASE` - Failed to create level
- `UPDATE_PROSPECT_LEVEL_USECASE` - Failed to update level
- `DELETE_PROSPECT_LEVEL_USECASE` - Failed to delete level


### Sources
- `CREATE_PROSPECT_SOURCE_USECASE` - Failed to create source
- `UPDATE_PROSPECT_SOURCE_USECASE` - Failed to update source
- `DELETE_PROSPECT_SOURCE_USECASE` - Failed to delete source
- `PROSPECT_NOT_FOUND` - Prospect profile does not exist

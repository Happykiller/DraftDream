# Feature: Client Management

## Description
The client management feature allows coaches to track detailed information about their clients beyond basic user profiles. This includes fitness goals, activity preferences, fitness levels, lead sources, and account status tracking for business insights.

## Roles
- **ADMIN**: Full access to all client data
- **COACH**: Can manage their own clients
- **ATHLETE**: Can view/update their own client profile

---

## Domain: Client Objectives

### Scenario: Create a client objective

**Given** a client exists with ID `client-1`
**And** the client is working with coach `coach-1`

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

### Scenario: Record client activity preferences

**Given** a client profile exists
**And** the client is filling out their onboarding questionnaire

**When** the client selects their preferences:
```json
{
  "label": "Running",
  "preferenceLevel": "high",
  "frequency_per_week": 3,
  "notes": "Prefers outdoor running",
  "is_active": true,
  "createdBy": "client-1"
}
```

**Then** the system should:
1. Store the activity preference
2. Generate slug: `running`
3. Associate with client profile
4. Enable preference-based program recommendations

---

## Domain: Client Levels

### Scenario: Assess client fitness level

**Given** a new client has completed their fitness assessment
**And** the coach evaluated their capabilities

**When** the coach sets the client level:
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

## Domain: Client Status

### Description
Client status is tracked via a fixed set of states to monitor the lifecycle of a prospect/client.

### Status Values
- **LEAD**: Initial contact or potential client
- **CONTACTE**: Contact has been made
- **RDV_PLANIFIE**: Appointment scheduled
- **PROPOSITION**: Proposal sent
- **NEGOCIATION**: In negotiation
- **GAGNE**: Client won / signed
- **PERDUS**: Client lost
- **A_FAIRE**: Action required
- **CLIENT**: Active client

### Scenario: Update client status

**Given** a client exists with status `LEAD`
**When** the coach contacts the client
**Then** the coach updates the client profile with status `CONTACTE`

---

## Domain: Client Sources

### Scenario: Track client acquisition source

**Given** a new client is onboarding
**And** the client came from a marketing campaign

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

## Scenario: List clients with multiple filters

**Given** multiple clients exist:
  - Client A: level=beginner, status=active, objective=weight-loss
  - Client B: level=advanced, status=inactive, objective=muscle-gain
  - Client C: level=beginner, status=active, objective=general-fitness

**When** a coach requests clients with filters:
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
4. Return Clients A and C

**And** inactive clients should be excluded

---

## Business Rules

### Client Profiles
- Extends base User entity with fitness-specific data
- One client profile per user
- Managed primarily by assigned coach
- Self-service updates for athletes (limited fields)

### Objectives
- **Slug**: Auto-generated from label
- **Types**: Weight loss, muscle gain, strength, endurance, general fitness
- **Tracking**: Target value, unit, target date
- **Multiple**: Clients can have multiple objectives
- **Active**: Only one active objective per type recommended

### Activity Preferences
- **Preference Levels**: none, low, medium, high
- **Frequency**: Sessions per week
- **Purpose**: Guide program recommendations
- **Updates**: Can change as client preferences evolve

### Fitness Levels
- **Standard Levels**: Beginner, intermediate, advanced, elite
- **Assessment**: Based on coach evaluation and performance
- **Progression**: Should be updated as client improves
- **Impact**: Affects program difficulty and exercise selection

### Status Tracking
- **Enum Based**: Status is a fixed enum on the Client profile.
- **Lifecycle**: Tracks progression from Lead to Client (or Lost).
- **Business Metrics**: Used for conversion and pipeline analysis.

### Source Tracking
- **Channels**: Organic, referral, paid ads, social media, etc.
- **Campaign**: Specific marketing campaign identifier
- **Attribution**: First-touch attribution model
- **Analytics**: Enable ROI calculation and campaign optimization

---

## CRUD Operations (Each Sub-Domain)

### Create
- **Authorization**: COACH (own clients), ADMIN
- **Validation**: Client exists, slug uniqueness per locale
- **Auto-generation**: Slug from label

### Get
- **Authorization**: COACH (own clients), ATHLETE (self), ADMIN
- **Returns**: Complete entity details

### List
- **Authorization**: COACH (own clients), ADMIN (all)
- **Filters**: By client, by type, by status, date range
- **Sorting**: By date, label, preference level

### Update
- **Authorization**: COACH (own clients), ADMIN
- **Slug Update**: Regenerated if label changes
- **Partial**: Only specified fields updated

### Delete
- **Authorization**: COACH (own clients), ADMIN
- **Type**: Soft delete (mark inactive) recommended

---

## GraphQL Operations

### Create Client Objective
```graphql
mutation CreateClientObjective($input: CreateClientObjectiveInput!) {
  createClientObjective(input: $input) {
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

### List Client Preferences
```graphql
query ListClientPreferences($clientId: ID!) {
  listClientActivityPreferences(clientId: $clientId) {
    id
    label
    preferenceLevel
    frequency_per_week
  }
}
```

### Update Client Level
```graphql
mutation UpdateClientLevel($id: ID!, $input: UpdateClientLevelInput!) {
  updateClientLevel(id: $id, input: $input) {
    id
    label
    assessmentDate
    updatedAt
  }
}
```

---

## Reporting & Analytics

### Client Segmentation
- By fitness level (beginner/intermediate/advanced)
- By activity preferences
- By objectives
- By acquisition source
- By status

### Retention Metrics
- Active vs inactive clients
- Churn rate by segment
- Status transition analysis
- Reactivation rates

### Marketing Attribution
- Clients by source
- Conversion rates by channel
- Campaign performance
- ROI by marketing spend

---

## Error Codes

### Objectives
- `CREATE_CLIENT_OBJECTIVE_USECASE` - Failed to create objective
- `UPDATE_CLIENT_OBJECTIVE_USECASE` - Failed to update objective
- `DELETE_CLIENT_OBJECTIVE_USECASE` - Failed to delete objective
- `OBJECTIVE_NOT_FOUND` - Objective does not exist

### Activity Preferences
- `CREATE_CLIENT_ACTIVITY_PREFERENCE_USECASE` - Failed to create preference
- `UPDATE_CLIENT_ACTIVITY_PREFERENCE_USECASE` - Failed to update preference
- `DELETE_CLIENT_ACTIVITY_PREFERENCE_USECASE` - Failed to delete preference

### Levels
- `CREATE_CLIENT_LEVEL_USECASE` - Failed to create level
- `UPDATE_CLIENT_LEVEL_USECASE` - Failed to update level
- `DELETE_CLIENT_LEVEL_USECASE` - Failed to delete level


### Sources
- `CREATE_CLIENT_SOURCE_USECASE` - Failed to create source
- `UPDATE_CLIENT_SOURCE_USECASE` - Failed to update source
- `DELETE_CLIENT_SOURCE_USECASE` - Failed to delete source
- `CLIENT_NOT_FOUND` - Client profile does not exist

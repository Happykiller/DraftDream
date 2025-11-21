# DraftDream API - Functional Documentation

## Overview
This directory contains comprehensive functional documentation for the DraftDream/fitdesk API, written in Gherkin (Given/When/Then) format. Each feature document details the business scenarios, rules, and technical implementation.

## Documentation Structure

### 📋 Core Features

#### [Authentication](./authentication.md)
User authentication using JWT tokens with email and password
- Login scenarios
- Token generation
- Error handling
- Password verification with Argon2

#### [User Management](./user-management.md)
Create, read, update, and delete user accounts
- Admin, Coach, and Athlete roles
- Password hashing
- User profiles
- CRUD operations

---

### 👥 Relationship Management

#### [Coach-Athlete Management](./coach-athlete.md)
Manage coaching relationships between coaches and athletes
- Create coach-athlete links
- Track active periods
- Manage coaching notes
- Relationship lifecycle

---

### 🏋️ Sport Domain

#### [Program Management](./program-management.md)
Training program creation and organization
- Multi-session programs
- Localization support
- Difficulty levels
- Slug auto-generation
- Program duration and structure

#### Session Management
Individual training sessions within programs
- Exercise composition
- Session ordering
- REST periods and sets/reps
- Session templates

#### Exercise Management
Exercise catalog and definitions
- Muscle groups
- Equipment requirements
- Exercise categories
- Technique descriptions

---

### 🥗 Nutrition Domain

#### [Meal Plan Management](./meal-plan-management.md)
Personalized nutrition plans for clients
- Multi-day meal plans
- Calorie tracking
- Meal types (breakfast, lunch, dinner)
- Nutritional information

#### Meal Management
Individual meals and recipes
- Ingredients
- Preparation instructions
- Macronutrient breakdown
- Portion sizes

---

### 👤 Client Management

#### Client Profiles
Client information and onboarding
- Personal details
- Goals and objectives
- Activity preferences
- Source tracking

#### Client Objectives
Track client fitness goals
- Weight loss, muscle gain, etc.
- Target dates
- Progress tracking

#### Client Levels
Fitness level classification
- Beginner, intermediate, advanced
- Skill assessments

#### Client Status
Client account lifecycle
- Active, inactive, churned
- Status transitions
- Retention tracking

---

## How to Read This Documentation

### Gherkin Format
Each feature uses the Gherkin syntax:
- **Feature**: High-level description of functionality
- **Scenario**: Specific use case or workflow
- **Given**: Pre-conditions and context
- **When**: The action being performed
- **Then**: Expected outcomes
- **And**: Additional conditions or expectations

### Example
```gherkin
Scenario: Create a new user
  Given an admin is authenticated
  And no user exists with email "new@example.com"
  When the admin creates a user with:
    - Email: "new@example.com"
    - Type: "coach"
  Then the system should:
    1. Hash the password
    2. Create the user in database
    3. Return the created user
  And the password should never be in the response
```

---

## Feature Documentation Sections

Each feature document includes:

### 1. Description
High-level overview of what the feature does

### 2. Roles
Which user roles can access this feature

### 3. Scenarios
Detailed Gherkin scenarios covering:
- Success cases
- Edge cases
- Error conditions
- Validation rules

### 4. Business Rules
Domain logic and constraints:
- Validation rules
- Uniqueness constraints
- Status transitions
- Calculation formulas

### 5. CRUD Operations
Standard operations with:
- Use case names
- Authorization requirements
- Validation rules
- Return types

### 6. GraphQL Operations
Example queries and mutations:
- Request format
- Response structure
- Variables
- Field selection

### 7. Error Codes
Possible error codes with descriptions

---

## Domain Model Overview

```
User (ADMIN, COACH, ATHLETE)
├── Authentication (JWT tokens)
├── Coach-Athlete Links
│   └── Athletes managed by coaches
├── Programs (created by coaches)
│   └── Sessions
│       └── Exercises
│           ├── Muscle Groups
│           ├── Equipment
│           └── Categories
├── Meal Plans (assigned to athletes)
│   └── Meal Days
│       └── Meal Types
│           └── Meals
└── Client Data
    ├── Objectives
    ├── Activity Preferences
    ├── Levels
    ├── Status
    └── Sources
```

---

## Common Patterns

### Slug Generation
Most entities auto-generate a URL-friendly slug:
- From the `label` field
- Lowercase with hyphens
- Fallback to entity type if label is empty
- Must be unique per locale

### Localization
Content supports multiple languages:
- `locale` field (e.g., "en", "fr")
- Slug uniqueness per locale
- Locale-specific content

### Audit Trail
All entities track:
- `createdBy`: Creator user ID
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

### Active Status
Most entities have `is_active` flag:
- Controls visibility
- Soft delete mechanism
- Historical data retention

### Authorization
Three-tier role system:
- **ADMIN**: Full access to everything
- **COACH**: Manage own resources and assigned clients
- **ATHLETE**: View assigned resources, limited write

---

## Testing
All scenarios are backed by comprehensive Jest tests:
- 115 test suites
- 456 passing tests
- Located in `**/__tests__/**/*.spec.ts`
- Mock-based unit tests for each use case

---

## GraphQL Schema
The complete GraphQL schema is available:
- **File**: `gqlschema.gql` (root directory)
- **Playground**: Available in development mode
- **URL**: `http://localhost:3000/graphql`

---

## Related Documentation
- [README.md](../../README.md) - Setup and configuration
- [AGENT.MD](../../AGENT.MD) - Development guidelines
- API Examples: `docs/*.http` files

---

## Contributing
When adding new features:
1. Create a new feature document in this directory
2. Follow the Gherkin format
3. Include all sections (scenarios, rules, operations, errors)
4. Update this index with a link to the new feature
5. Add corresponding tests

---

## Questions or Issues?
For questions about functionality or to report issues, please refer to:
- GraphQL Playground for API exploration
- Test files for implementation examples
- README.md for operational details

# Feature: Tag Management

## Description
The tag management feature provides a flexible categorization system for organizing and filtering content across the platform. Tags can be applied to programs, exercises, meals, and other entities to enable efficient search and discovery.

## Roles
- **ADMIN**: Can create and manage all tags
- **COACH**: Can create tags and apply to their content
- **ATHLETE**: Can view tags, read-only access

---

## Scenario: Create a new tag

**Given** an admin or coach is authenticated
**And** no existing tag with label "HIIT" in locale "en"

**When** the user creates a new tag:
```json
{
  "label": "HIIT",
  "locale": "en",
  "description": "High Intensity Interval Training",
  "category": "workout_type",
  "is_active": true,
  "createdBy": "admin-1"
}
```

**Then** the system should:
1. Generate slug from label: `hiit`
2. Create the tag in database
3. Set creation timestamps
4. Return the created tag

**And** the response should include:
```json
{
  "id": "<TAG_ID>",
  "label": "HIIT",
  "slug": "hiit",
  "locale": "en",
  "description": "High Intensity Interval Training",
  "category": "workout_type",
  "is_active": true,
  "createdAt": "<TIMESTAMP>",
  "updatedAt": "<TIMESTAMP>"
}
```

---

## Scenario: Create tag with auto-generated slug

**Given** a coach creates a tag with label "Perte de Poids"

**When** the system processes the creation

**Then** the slug should be generated as: `perte-de-poids`

**And** special characters and accents should be handled properly

**And** spaces should be converted to hyphens

---

## Scenario: Tag slug uniqueness per locale

**Given** a tag exists with:
  - Slug: `cardio`
  - Locale: `en`

**When** a user creates a tag with:
  - Label: "Cardio" (generates slug `cardio`)
  - Locale: `fr`

**Then** the creation should succeed

**And** both tags should exist (different locales)

**But** if locale is also `en`, creation should fail or return null

---

## Scenario: Retrieve a tag by ID

**Given** a tag exists with ID `tag-1`

**When** a user requests the tag

**Then** the system should:
1. Query the tag by ID
2. Return all tag details

**And** the response should include all fields

---

## Scenario: List tags with filters

**Given** multiple tags exist:
  - Tag A: label="Running", category="activity", locale="en", active=true
  - Tag B: label="Swimming", category="activity", locale="en", active=true
  - Tag C: label="Yoga", category="activity", locale="en", active=false
  - Tag D: label="Natation", category="activity", locale="fr", active=true

**When** a user requests tags with filters:
```json
{
  "locale": "en",
  "category": "activity",
  "is_active": true
}
```

**Then** the system should return:
- Tag A (Running)
- Tag B (Swimming)

**And** inactive tags should be excluded
**And** tags in other locales should be excluded

---

## Scenario: Update a tag

**Given** a tag exists with ID `tag-1`
**And** the tag has label "Beginner"

**When** an admin updates the tag:
```json
{
  "id": "tag-1",
  "label": "Beginner Friendly",
  "description": "Suitable for fitness beginners"
}
```

**Then** the system should:
1. Regenerate slug: `beginner-friendly`
2. Update description
3. Update `updatedAt` timestamp
4. Keep other fields unchanged
5. Return updated tag

---

## Scenario: Delete a tag

**Given** a tag exists with ID `tag-1`
**And** the tag may be referenced by programs or exercises

**When** an admin deletes the tag

**Then** the system should:
1. Check if tag is in use (optional)
2. Either soft delete (set inactive) or hard delete
3. Update/remove references to this tag
4. Return success confirmation

---

## Scenario: Search tags by partial label

**Given** tags exist with labels:
  - "Strength Training"
  - "Strength Building"
  - "Core Strength"

**When** a user searches for tags with text "strength"

**Then** all three tags should be returned

**And** search should be case-insensitive

---

## Business Rules

### Tag Structure
- **Label**: Display name (required)
- **Slug**: URL-friendly identifier (auto-generated)
- **Locale**: Language code (en, fr, etc.)
- **Description**: Detailed explanation (optional)
- **Category**: Tag grouping (workout_type, difficulty, goal, equipment, etc.)
- **Color**: UI color code for display (optional)
- **Icon**: Icon identifier for display (optional)

### Slug Generation
- Auto-generated from label using `buildSlug()` utility
- Handles accents, special characters, spaces
- Fallback slug is `tag` if label is empty
- Must be unique per locale

### Categorization
Common tag categories:
- `workout_type`: HIIT, strength, cardio, flexibility
- `difficulty`: beginner, intermediate, advanced
- `goal`: weight-loss, muscle-gain, endurance
- `equipment`: dumbbells, barbell, bodyweight
- `body_part`: upper-body, lower-body, core
- `duration`: quick, standard, extended
- `dietary`: vegan, vegetarian, keto, paleo

### Localization
- Tags are locale-specific
- Same concept can have tags in multiple languages
- Slug uniqueness enforced per locale
- Enables multilingual tagging

### Active Status
- `is_active`: Controls tag visibility
- Inactive tags hidden from selection
- Can soft-delete by marking inactive
- Maintains historical tag data

### Usage Tracking (Optional)
- Count of entities using each tag
- Popular tags for recommendations
- Unused tag cleanup

---

## Tag Application

### Programs
```graphql
program {
  tags {
    label
    slug
    category
  }
}
```

### Exercises
```graphql
exercise {
  tags {
    label
    category
  }
}
```

### Meals
```graphql
meal {
  tags {
    label  # e.g., "vegan", "high-protein"
  }
}
```

---

## CRUD Operations

### Create Tag
- **Use Case**: `CreateTagUsecase`
- **Authorization**: COACH, ADMIN
- **Auto-generation**: Slug from label
- **Validation**: Uniqueness per locale

### Get Tag
- **Use Case**: `GetTagUsecase`
- **Authorization**: ALL roles
- **Returns**: Complete tag details

### List Tags
- **Use Case**: `ListTagsUsecase`
- **Authorization**: ALL roles
- **Filters**: locale, category, is_active, search text
- **Sorting**: By label, usage count, created date

### Update Tag
- **Use Case**: `UpdateTagUsecase`
- **Authorization**: Creator COACH, ADMIN
- **Slug Update**: Re-generated if label changes
- **Returns**: Updated tag

### Delete Tag
- **Use Case**: `DeleteTagUsecase`
- **Authorization**: ADMIN only
- **Type**: Soft delete (recommended) or hard delete
- **Impact**: May affect tagged entities

---

## GraphQL Operations

### Create Tag
```graphql
mutation CreateTag($input: CreateTagInput!) {
  createTag(input: $input) {
    id
    label
    slug
    locale
    category
    description
    is_active
  }
}
```

### List Tags
```graphql
query ListTags($locale: String, $category: String, $is_active: Boolean) {
  listTags(locale: $locale, category: $category, is_active: $is_active) {
    id
    label
    slug
    category
  }
}
```

### Search Tags
```graphql
query SearchTags($searchText: String!, $locale: String) {
  searchTags(searchText: $searchText, locale: $locale) {
    id
    label
    slug
    category
  }
}
```

---

## Use Cases

### Content Discovery
- Filter programs by workout type tags
- Find exercises by muscle group tags
- Search meals by dietary restriction tags

### Organization
- Group related content
- Create curated collections
- Build recommendation systems

### Multi-Language Support
- Same tag concept in different languages
- Language-specific tag browsing
- Locale-aware filtering

### Analytics
- Most used tags
- Trending tags
- Tag effectiveness metrics

---

## Error Codes
- `CREATE_TAG_USECASE` - Failed to create tag
- `GET_TAG_USECASE` - Failed to retrieve tag
- `UPDATE_TAG_USECASE` - Failed to update tag
- `DELETE_TAG_USECASE` - Failed to delete tag
- `TAG_NOT_FOUND` - Tag does not exist  
- `DUPLICATE_TAG_SLUG` - Slug/locale combination already exists
- `TAG_IN_USE` - Cannot delete tag that is referenced

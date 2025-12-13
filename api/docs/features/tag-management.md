# Feature: Tag Management

## Description
The tag management feature provides a system for organizing content across the platform. Tags can be applied to programs, exercises, and other entities to enable efficient search and discovery.

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
  "visibility": "PUBLIC",
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
  "visibility": "PUBLIC",
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
  - Tag A: label="Running", locale="en", visibility="PUBLIC"
  - Tag B: label="Swimming", locale="en", visibility="PUBLIC"
  - Tag C: label="Yoga", locale="en", visibility="PRIVATE"
  - Tag D: label="Natation", locale="fr", visibility="PUBLIC"

**When** a user requests tags with filters:
```json
{
  "locale": "en",
  "visibility": "PUBLIC"
}
```

**Then** the system should return:
- Tag A (Running)
- Tag B (Swimming)

**And** private tags should be excluded (unless authorized)
**And** tags in other locales should be excluded

---

## Scenario: Update a tag

**Given** a tag exists with ID `tag-1`
**And** the tag has label "Beginner"

**When** an admin updates the tag:
```json
{
  "id": "tag-1",
  "label": "Beginner Friendly"
}
```

**Then** the system should:
1. Regenerate slug: `beginner-friendly`
2. Update `updatedAt` timestamp
3. Keep other fields unchanged
4. Return updated tag

---

## Scenario: Delete a tag

**Given** a tag exists with ID `tag-1`

**When** an admin deletes the tag

**Then** the system should:
1. Either soft delete or hard delete
2. Return success confirmation

---

## Business Rules

### Tag Structure
- **Label**: Display name (required)
- **Slug**: URL-friendly identifier (auto-generated)
- **Locale**: Language code (en, fr, etc.)
- **Visibility**: Controls tag visibility (PUBLIC, PRIVATE)

### Slug Generation
- Auto-generated from label using `buildSlug()` utility
- Handles accents, special characters, spaces
- Fallback slug is `tag` if label is empty
- Must be unique per locale

### Localization
- Tags are locale-specific
- Same concept can have tags in multiple languages
- Slug uniqueness enforced per locale
- Enables multilingual tagging

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
- **Filters**: locale, visibility, search text
- **Sorting**: By label, created date

### Update Tag
- **Use Case**: `UpdateTagUsecase`
- **Authorization**: Creator COACH, ADMIN
- **Slug Update**: Re-generated if label changes
- **Returns**: Updated tag

### Delete Tag
- **Use Case**: `DeleteTagUsecase`
- **Authorization**: ADMIN only

---

## GraphQL Operations

### Create Tag
```graphql
mutation TagCreate($input: CreateTagInput!) {
  tag_create(input: $input) {
    id
    label
    slug
    locale
    visibility
  }
}
```

### List Tags
```graphql
query TagList($locale: String, $visibility: Visibility) {
  tag_list(locale: $locale, visibility: $visibility) {
    items {
        id
        label
        slug
        visibility
    }
  }
}
```

---

## Error Codes
- `CREATE_TAG_USECASE` - Failed to create tag
- `GET_TAG_USECASE` - Failed to retrieve tag
- `UPDATE_TAG_USECASE` - Failed to update tag
- `DELETE_TAG_USECASE` - Failed to delete tag
- `TAG_NOT_FOUND` - Tag does not exist  
- `DUPLICATE_TAG_SLUG` - Slug/locale combination already exists

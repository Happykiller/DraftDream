# Feature: Athlete Info Management

## Description
The athlete info feature stores athlete-specific intake data based on the existing prospect referentials. Each athlete can keep a single profile describing level, objectives, activity preferences, medical conditions, allergies, and private notes, while preserving auditability and deletion options.

## Roles
- **ADMIN**: Full create/read/update/delete access, including hard delete
- **COACH**: Create and update athlete info for athletes they manage; list and read according to visibility rules
- **ATHLETE**: Can view and maintain their own athlete info record

---

## Scenario: Create athlete info

**Given** an authenticated user with role ADMIN, COACH, or ATHLETE
**And** the athlete has no existing athlete info record
**And** prospect referentials exist for level, objectives, and activity preferences

**When** the user creates the athlete info via GraphQL:
```json
{
  "query": "mutation CreateAthleteInfo($input: CreateAthleteInfoInput!) { athleteInfo_create(input: $input) { id userId levelId objectiveIds activityPreferenceIds medicalConditions allergies notes createdBy createdAt updatedAt } }",
  "variables": {
    "input": {
      "userId": "athlete-1",
      "levelId": "level-1",
      "objectiveIds": ["objective-1", "objective-2"],
      "activityPreferenceIds": ["activity-1"],
      "medicalConditions": "asthma",
      "allergies": "peanuts",
      "notes": "prefers morning sessions"
    }
  }
}
```

**Then** the system should:
1. Verify the referenced athlete, level, objectives, and activity preferences exist
2. Enforce uniqueness so only one athlete info exists per athlete
3. Persist the record with the authenticated user as creator
4. Return the complete athlete info payload with audit fields

---

## Scenario: Prevent duplicate athlete info

**Given** an athlete already has an athlete info record
**When** a user attempts to create another athlete info for the same athlete
**Then** the system should reject the request with a uniqueness violation and keep only the original record

---

## Scenario: Update athlete info

**Given** an athlete info record exists for `athlete-1`
**And** the authenticated user owns the record or is an admin

**When** the user updates the record:
```json
{
  "query": "mutation UpdateAthleteInfo($input: UpdateAthleteInfoInput!) { athleteInfo_update(input: $input) { id levelId objectiveIds activityPreferenceIds medicalConditions allergies notes updatedAt } }",
  "variables": {
    "input": {
      "id": "athlete-info-1",
      "objectiveIds": ["objective-3"],
      "medicalConditions": "none",
      "notes": "cleared by doctor"
    }
  }
}
```

**Then** the system should:
1. Validate updated references
2. Persist the changes and refresh `updatedAt`
3. Preserve audit data and uniqueness

---

## Scenario: List athlete infos with archival filter

**Given** multiple athlete info records exist (active and soft-deleted)
**When** a user lists athlete infos with `includeArchived: true` and pagination
**Then** the response should return total count, current page, limit, and all matching records including archived ones
**And** each item should expose athlete, creator, level, objectives, and activity preferences through the resolver fields

---

## Scenario: Soft delete athlete info

**Given** an athlete info record exists
**And** the authenticated user is the creator or an admin

**When** the user calls `athleteInfo_delete(id)`
**Then** the system should mark the record as deleted (soft delete) and exclude it from default listings

---

## Scenario: Hard delete athlete info

**Given** an athlete info record exists
**And** the authenticated user has ADMIN role

**When** the user calls `athleteInfo_hardDelete(id)`
**Then** the system should permanently remove the record from storage

---

## Business Rules
- Exactly one athlete info record is allowed per athlete; creation enforces a unique index on `userId`
- Level, objectives, and activity preferences must reference existing prospect entities
- Authorization mirrors other athlete flows: ADMIN can manage all records; COACH and ATHLETE are limited to permitted athletes and cannot hard delete
- Soft deletion keeps audit data (`createdBy`, `createdAt`, `updatedAt`, `deletedAt`); hard deletion is admin-only
- Medical conditions and allergies are sensitive and remain private even when other content is public

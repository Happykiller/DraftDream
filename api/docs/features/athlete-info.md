# Feature: Athlete Info Management

## Description
The athlete info feature stores athlete-specific intake data based on the existing prospect referentials. Each athlete can keep a single profile describing level, objectives, activity preferences, medical conditions, allergies, and private notes, while preserving auditability and deletion options.

## Roles
- **ADMIN**: Full create/read/update/delete access, including hard delete
- **COACH**: Create and update athlete info for athletes they manage; can only list/read records they created.
- **ATHLETE**: Can view/update their own athlete info record ONLY IF they created it.

---

## Scenario: Create athlete info

**Given** an authenticated user with role ADMIN, COACH, or ATHLETE
**And** the athlete has no existing athlete info record

**When** the user creates the athlete info via GraphQL

**Then** the system should:
1. Verify the referenced athlete exists
2. Enforce uniqueness so only one athlete info exists per athlete
3. Persist the record with the authenticated user as creator
4. Return the complete athlete info payload with audit fields

---

## Scenario: Prevent duplicate athlete info

**Given** an athlete already has an athlete info record
**When** a user attempts to create another athlete info for the same athlete
**Then** the system should reject the request with a uniqueness violation

---

## Scenario: Update athlete info

**Given** an athlete info record exists for `athlete-1`
**And** the authenticated user is the creator or an admin

**When** the user updates the record

**Then** the system should:
1. Persist the changes and refresh `updatedAt`
2. Preserve audit data and uniqueness

---

## Scenario: List athlete infos with archival filter

**Given** multiple athlete info records exist (active and soft-deleted)
**When** an ADMIN lists athlete infos with `includeArchived: true`
**Then** the response should return all matching records including archived ones

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
- Exactly one athlete info record is allowed per athlete.
- Authorization: ADMIN can manage all records; COACH and ATHLETE are limited to records they created (strict ownership).
- Soft deletion keeps audit data (`createdBy`, `createdAt`, `updatedAt`, `deletedAt`); hard deletion is admin-only.

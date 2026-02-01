# Feature: Note Management

## Description
Note management provides a lightweight tracking entity for internal notes. Each note includes a label, a description, and an optional athlete reference, with standard audit metadata.

## Roles
- **ADMIN**: Full access to all notes, including hard delete
- **COACH**: Manage only notes they created
- **ATHLETE**: Manage only notes they created

---

## Scenario: Create a new note

**Given** a coach is authenticated
**When** the coach creates a note:
```json
{
  "label": "Weekly check-in",
  "description": "Discuss progress and adjust plan.",
  "athleteId": "athlete-123"
}
```

**Then** the system should:
1. Persist the note with `createdBy` set to the authenticated user
2. Store the `athleteId` when provided
3. Set `createdAt` and `updatedAt` timestamps
4. Return the created note

---

## Scenario: Retrieve a note by ID

**Given** a note exists with ID `note-1`
**When** the creator or an admin requests the note
**Then** the system should return the note details

---

## Scenario: List notes with filters

**Given** multiple notes exist for different athletes
**When** a user lists notes with filters:
```json
{
  "athleteId": "athlete-123"
}
```
**Then** the system should return only matching notes
**And** non-admin users should see only their own notes

---

## Scenario: Update a note

**Given** a note exists with ID `note-1`
**When** the creator updates the note:
```json
{
  "id": "note-1",
  "description": "Update athlete progress summary."
}
```
**Then** the system should update the note and refresh `updatedAt`

---

## Scenario: Soft delete a note

**Given** a note exists with ID `note-1`
**When** the creator deletes the note
**Then** the system should set `deletedAt` and return success

---

## Scenario: Hard delete a note (admin only)

**Given** a note exists with ID `note-1`
**When** an admin hard deletes the note
**Then** the system should permanently remove the note

---

## Business Rules

### Note Structure
- **Label**: Required, user-defined
- **Description**: Required
- **Athlete**: Optional user reference

### Ownership & Authorization
- Coaches and athletes can only create, read, list, update, and delete their own notes
- Admins can manage all notes
- Hard delete is reserved for admins

---

## CRUD Operations

### Create Note
- **Use Case**: `CreateNoteUsecase`
- **Authorization**: ADMIN, COACH, ATHLETE

### Get Note
- **Use Case**: `GetNoteUsecase`
- **Authorization**: Creator or ADMIN

### List Notes
- **Use Case**: `ListNotesUsecase`
- **Authorization**: ADMIN, COACH, ATHLETE
- **Filters**: athleteId, createdBy

### Update Note
- **Use Case**: `UpdateNoteUsecase`
- **Authorization**: Creator or ADMIN

### Delete Note (Soft)
- **Use Case**: `DeleteNoteUsecase`
- **Authorization**: Creator or ADMIN

### Hard Delete Note
- **Use Case**: `HardDeleteNoteUsecase`
- **Authorization**: ADMIN only

---

## GraphQL Operations

### Create Note
```graphql
mutation NoteCreate($input: CreateNoteInput!) {
  note_create(input: $input) {
    id
    label
    description
    athleteId
  }
}
```

### List Notes
```graphql
query NoteList($input: ListNotesInput) {
  note_list(input: $input) {
    items {
      id
      label
      description
      athleteId
    }
  }
}
```

---

## Error Codes
- `CREATE_NOTE_USECASE` - Failed to create note
- `GET_NOTE_USECASE` - Failed to retrieve note
- `LIST_NOTES_USECASE` - Failed to list notes
- `UPDATE_NOTE_USECASE` - Failed to update note
- `DELETE_NOTE_USECASE` - Failed to delete note
- `HARD_DELETE_NOTE_USECASE` - Failed to hard delete note
- `GET_NOTE_FORBIDDEN` - Access denied for note retrieval
- `DELETE_NOTE_FORBIDDEN` - Access denied for note deletion
- `HARD_DELETE_NOTE_FORBIDDEN` - Access denied for hard delete

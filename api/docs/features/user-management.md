# Feature: User Management

## Description
The user management feature allows administrators to create, read, and update user accounts. Users can be of three types: ADMIN, COACH, or ATHLETE. The system handles password hashing, validation, and maintains user profiles with contact information.

## Roles
- **ADMIN**: Can manage all users
- **COACH**: Can manage their clients/athletes
- **ATHLETE**: Limited access to their own profile

---

## Scenario: Create a new coach user

**Given** an admin user authenticated in the system
**And** no existing user with email `sam.stone@example.com`

**When** the admin creates a new user with the following details:
```json
{
  "type": "coach",
  "first_name": "Sam",
  "last_name": "Stone",
  "email": "sam.stone@example.com",
  "phone": "+33102030405",
  "address": {
    "name": "HQ",
    "city": "Paris",
    "code": "75000",
    "country": "FR"
  },
  "password": "Secret!123",
  "confirm_password": "Secret!123",
  "company": {
    "name": "Fitdesk"
  },
  "is_active": true,
  "createdBy": "admin-1"
}
```

**Then** the system should:
1. Hash the password using Argon2
2. Create the user in the database with hashed password
3. Generate a unique user ID
4. Set creation and update timestamps
5. Return the created user (without password field)

**And** the response should contain:
```json
{
  "id": "<USER_ID>",
  "type": "coach",
  "first_name": "Sam",
  "last_name": "Stone",
  "email": "sam.stone@example.com",
  "phone": "+33102030405",
  "address": {
    "name": "HQ",
    "city": "Paris",
    "code": "75000",
    "country": "FR"
  },
  "company": {
    "name": "Fitdesk"
  },
  "is_active": true,
  "createdBy": "admin-1",
  "createdAt": "<TIMESTAMP>",
  "updatedAt": "<TIMESTAMP>"
}
```

**And** the password should be stored as Argon2 hash in the database

---

## Scenario: Create user fails - Password hashing error

**Given** an admin user authenticated in the system
**And** the password hashing service fails unexpectedly

**When** the admin attempts to create a new user

**Then** the system should:
1. Attempt to hash the password
2. Encounter hashing failure
3. Log the error: `CreateUserUsecase#execute=>hash failed`
4. Not create the user in the database
5. Throw error: `CREATE_USER_USECASE`

**And** no user should be persisted

---

## Scenario: Create user fails - Database error

**Given** an admin user authenticated in the system
**And** the password is successfully hashed
**But** the database is offline or encounters an error

**When** the admin attempts to create a new user

**Then** the system should:
1. Successfully hash the password
2. Attempt to create the user in database
3. Encounter database failure
4. Log the error: `CreateUserUsecase#execute=>database offline`
5. Throw error: `CREATE_USER_USECASE`

**And** no user should be persisted

---

**And** other fields should remain unchanged

---

## Scenario: User updates their own profile (Self-Update)

**Given** a user is authenticated with ID `user-77`

**When** the user updates their own information using `me_update`:
```json
{
  "first_name": "Johnny",
  "phone": "+33612345678"
}
```

**Then** the system should:
1. Use the ID from the session context (`user-77`)
2. Update only the allowed profile fields (`first_name`, `last_name`, `email`, `phone`, `address`, `company`)
3. Prevent updating protected fields like `type` or `is_active`
4. Update the `updatedAt` timestamp
5. Return the updated user

---

## Scenario: User updates their own password

**Given** a user is authenticated with ID `user-77`

**When** the user updates their password using `me_update_password`:
```json
{
  "password": "NewSecurePassword!2025"
}
```

**Then** the system should:
1. Use the ID from the session context (`user-77`)
2. Hash the new password using Argon2
3. Update the password in the database
4. Return `true` on success

---

## Scenario: Retrieve user by email

**Given** a user exists with email `coach@example.com`

**When** the system retrieves the user by email:
```
email: "coach@example.com"
includePassword: false
```

**Then** the system should:
1. Query the database for the email
2. Return the user without password field

**And** the response should contain all user details except password

---

## Scenario: Retrieve user by email with password

**Given** a user exists with email `coach@example.com`
**And** the user has a hashed password stored

**When** the system retrieves the user by email with password:
```
email: "coach@example.com"
includePassword: true
```

**Then** the system should:
1. Query the database for the email
2. Return the user including the hashed password field

**And** the response should contain the password hash for authentication

---

## Business Rules

### User Types
- **ADMIN**: Full system access, can manage all resources
- **COACH**: Can create and manage programs, sessions, clients
- **ATHLETE**: Can view assigned programs and track progress

### Password Requirements
- Passwords must be provided during user creation
- Passwords are hashed using **Argon2** before storage
- Password and confirm_password must match
- Plain text passwords are never stored

### Email Uniqueness
- Each email address must be unique in the system
- Email validation is performed
- Duplicate emails are rejected

### User Status
- `is_active`: Boolean flag indicating if user can access the system
- Inactive users cannot authenticate
- Users can be deactivated instead of deleted

### Audit Trail
- `createdBy`: ID of the user who created this account
- `createdAt`: Timestamp of account creation
- `updatedAt`: Timestamp of last modification

---

## CRUD Operations

### Create User
- **Use Case**: `CreateUserUsecase`
- **Authorization**: ADMIN only
- **Validation**: Email uniqueness, password strength, required fields

### Get User
- **Use Case**: `GetUserUsecase`
- **Authorization**: ADMIN (any user), COACH/ATHLETE (own profile)
- **Options**: Include/exclude password field

### List Users
- **Use Case**: `ListUsersUsecase`
- **Authorization**: ADMIN
- **Filters**: By type, active status, created date range

### Update User
- **Use Case**: `UpdateUserUsecase` (Admin), `UpdateMeUsecase` (Self)
- **Authorization**: ADMIN (any user), COACH/ATHLETE (own profile via `me_update`)
- **Validation**: Email uniqueness if changed, restricted fields for non-admins

### Update Password
- **Use Case**: `UpdateUserPasswordUsecase` (Admin), `UpdateMePasswordUsecase` (Self)
- **Authorization**: ADMIN (any user), COACH/ATHLETE (own profile via `me_update_password`)

---

## GraphQL Operations

### Create User Mutation
```graphql
mutation UserCreate($input: CreateUserInput!) {
  user_create(input: $input) {
    id
    type
    first_name
    last_name
    email
    phone
    address {
      name
      city
      code
      country
    }
    company {
      name
    }
    is_active
    createdAt
    updatedAt
  }
}
```

### Get User Query
```graphql
query UserGet($id: ID!) {
  user_get(id: $id) {
    id
    type
    first_name
    last_name
    email
    phone
    is_active
  }
}
```

### Update User Mutation
```graphql
mutation UserUpdate($id: ID!, $input: UpdateUserInput!) {
  user_update(id: $id, input: $input) {
    id
    first_name
    last_name
    updatedAt
  }
}
```

### Self-Update Mutation
```graphql
mutation MeUpdate($input: UpdateMeInput!) {
  me_update(input: $input) {
    id
    first_name
    last_name
    email
    phone
    updatedAt
  }
}
```

### Self-Update Password Mutation
```graphql
mutation MeUpdatePassword($password: String!) {
  me_update_password(password: $password)
}
```

---

## Error Codes
- `CREATE_USER_USECASE` - Failed to create user
- `GET_USER_USECASE` - Failed to retrieve user
- `UPDATE_USER_USECASE` - Failed to update user
- `USER_NOT_FOUND` - User does not exist
- `DUPLICATE_EMAIL` - Email already registered

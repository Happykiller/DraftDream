# Feature: Authentication

## Description
The authentication feature allows users to securely log in to the DraftDream/fitdesk platform using their email and password. The system validates credentials and returns a JWT access token for authenticated sessions.

## Roles
- **ADMIN**: Platform administrator with full access
- **COACH**: Fitness coach managing programs and clients
- **ATHLETE**: End user accessing training programs

---

## Scenario: Successful user authentication

**Given** a registered user exists in the system with the following details:
- Email: `coach@example.com`
- Password: `P@ssw0rd` (hashed in database)
- Type: `COACH`
- Status: Active

**When** the user submits authentication credentials:
```json
{
  "email": "coach@example.com",
  "password": "P@ssw0rd"
}
```

**Then** the system should:
1. Retrieve the user by email from the database
2. Verify the password hash using Argon2
3. Generate a JWT access token containing:
   - User ID
   - Role: `COACH`
   - Email
   - Token type: `access`
4. Return the access token

**And** the response should be:
```json
{
  "access_token": "<JWT_TOKEN>"
}
```

---

## Scenario: Authentication fails - Unknown user

**Given** no user exists with email `unknown@example.com`

**When** the user attempts to authenticate with:
```json
{
  "email": "unknown@example.com",
  "password": "AnyPassword123"
}
```

**Then** the system should:
1. Attempt to retrieve the user by email
2. Find no matching user
3. Log the error: `AuthUsecase#execute=>INVALID_CREDENTIALS`
4. Reject the request with error: `INVALID_CREDENTIALS`

**And** no JWT token should be generated

---

## Scenario: Authentication fails - Missing password in database

**Given** a user exists with email `coach@example.com`
**But** the user's password field is `null` or `undefined` in the database

**When** the user attempts to authenticate with:
```json
{
  "email": "coach@example.com",
  "password": "P@ssw0rd"
}
```

**Then** the system should:
1. Retrieve the user by email
2. Detect missing password field
3. Log the error: `AuthUsecase#execute=>INVALID_CREDENTIALS`
4. Reject the request with error: `INVALID_CREDENTIALS`

**And** password verification should not be attempted

---

## Scenario: Authentication fails - Incorrect password

**Given** a registered user exists with:
- Email: `coach@example.com`
- Hashed password in database

**When** the user submits incorrect credentials:
```json
{
  "email": "coach@example.com",
  "password": "WrongPassword123"
}
```

**Then** the system should:
1. Retrieve the user by email
2. Verify the password using Argon2
3. Detect password mismatch
4. Log the error: `AuthUsecase#execute=>INVALID_CREDENTIALS`
5. Reject the request with error: `INVALID_CREDENTIALS`

**And** no JWT token should be generated

---

## Scenario: Authentication fails - JWT signing error

**Given** a registered user exists with valid credentials
**And** the user submits correct email and password

**When** the JWT signing service encounters an unexpected error

**Then** the system should:
1. Successfully retrieve the user
2. Successfully verify the password
3. Attempt to sign the JWT token
4. Encounter signing failure
5. Log the error: `AuthUsecase#execute=>signing failed`
6. Wrap the error as: `AUTH_USECASE_FAIL`
7. Reject the request with error: `AUTH_USECASE_FAIL`

---

## Business Rules

### Password Security
- Passwords are hashed using **Argon2** algorithm
- Plain text passwords are never stored in the database
- Password verification is performed securely using hash comparison

### JWT Token Structure
The JWT access token contains the following claims:
- `id`: User's unique identifier
- `role`: User's role in UPPERCASE (`ADMIN`, `COACH`, `ATHLETE`)
- `email`: User's email address
- `type`: Token type (`access`)

### Error Handling
- All authentication errors return `INVALID_CREDENTIALS` to avoid revealing whether email exists
- Unexpected system errors are wrapped as `AUTH_USECASE_FAIL`
- All errors are logged for monitoring and debugging

### Database Query
- User is retrieved with `includePassword: true` option
- Password field is excluded from normal queries for security

---

## Technical Details

### Implementation
- **Use Case**: `AuthUsecase`
- **DTO**: `AuthUsecaseDto` (email, password)
- **Model**: `SessionUsecaseModel` (access_token)
- **Dependencies**:
  - `BddService.user.getUserByEmail()` - Retrieve user by email
  - `CryptService.verify()` - Verify password hash
  - `JwtService.sign()` - Generate JWT token

### GraphQL Mutation
```graphql
mutation Auth($input: AuthInput!) {
  auth(input: $input) {
    access_token
  }
}
```

### Error Codes
- `INVALID_CREDENTIALS` - Authentication failed (wrong email or password)
- `AUTH_USECASE_FAIL` - Unexpected system error during authentication

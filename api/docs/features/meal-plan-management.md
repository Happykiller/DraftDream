# Feature: Meal Plan Management

## Description
The meal plan management feature allows coaches and nutritionists to create personalized nutrition plans for their clients. Meal plans contain multiple days, each day has different meal types (breakfast, lunch, dinner, snacks), and each meal type contains specific meals with nutritional information.

## Roles
- **ADMIN**: Full access to all meal plans
- **COACH**: Can create and manage meal plans for their clients
- **ATHLETE**: Can view their assigned meal plans

---

## Scenario: Create a comprehensive meal plan

**Given** a coach is authenticated with ID `coach-1`
**And** a client exists with ID `athlete-1`

**When** the coach creates a new meal plan:
```json
{
  "label": "Weight Loss Plan - Week 1",
  "locale": "fr",
  "description": "Balanced nutrition plan for gradual weight loss",
  "userId": "athlete-1",
  "startDate": "2024-01-01",
  "endDate": "2024-01-07",
  "is_active": true,
  "totalCalories": 1800,
  "days": [
    {
      "dayNumber": 1,
      "label": "Monday",
      "totalCalories": 1800,
      "mealTypes": [
        {
          "typeId": "breakfast",
          "meals": [
            {
              "label": "Oatmeal with fruits",
              "calories": 350,
              "order": 1
            }
          ]
        }
      ]
    }
  ],
  "createdBy": "coach-1"
}
```

**Then** the system should:
1. Generate a slug from the label: `weight-loss-plan-week-1`
2. Generate slugs for each day
3. Generate slugs for each meal
4. Create the complete meal plan structure
5. Set creation timestamps
6. Return the meal plan with all nested data

**And** the response should include:
- Meal plan ID and metadata
- All days with their meals
- Nutritional totals
- Audit information

---

## Scenario: Create meal plan with auto-calculated calories

**Given** a meal plan with 3 days
**And** each day has meals with specified calorie values

**When** the system creates the meal plan

**Then** the total calories should be calculated:
- Sum all meal calories per day
- Sum all day calories for the plan

**And** calorie totals should match the sum of individual meals

---

## Scenario: Retrieve meal plan with full details

**Given** a meal plan exists with ID `plan-1`
**And** the plan has 7 days
**And** each day has 4 meal types (breakfast, lunch, dinner, snack)

**When** a user retrieves the meal plan by ID

**Then** the system should:
1. Query the meal plan
2. Include all nested days
3. Include all meal types per day
4. Include all meals per type
5. Include nutritional information
6. Return the complete hydrated structure

**And** the response should have:
- Plan metadata (label, dates, user)
- Day-by-day breakdown
- Meal details with calories, macros
- Preparation instructions

---

## Scenario: List meal plans for a user

**Given** multiple meal plans exist:
  - Plan A: userId=`athlete-1`, active=true, dates=Jan 1-7
  - Plan B: userId=`athlete-1`, active=false, dates=Dec 1-7
  - Plan C: userId=`athlete-2`, active=true, dates=Jan 1-7

**When** athlete-1 requests their meal plans with filter:
```json
{
  "userId": "athlete-1",
  "is_active": true
}
```

**Then** the system should:
1. Filter by user ID
2. Filter by active status
3. Return only Plan A
4. Exclude inactive plans
5. Exclude other users' plans

**And** the result should contain 1 meal plan

---

## Scenario: Update a meal plan

**Given** a meal plan exists with ID `plan-1`
**And** the plan has label "Week 1 Plan"

**When** a coach updates the meal plan:
```json
{
  "id": "plan-1",
  "label": "Modified Week 1 - Low Carb",
  "totalCalories": 1600,
  "endDate": "2024-01-10"
}
```

**Then** the system should:
1. Regenerate slug from new label
2. Update specified fields
3. Update `updatedAt` timestamp
4. Keep unchanged fields as-is
5. Return updated meal plan

**And** nested days and meals should remain unchanged

---

## Scenario: Delete a meal plan

**Given** a meal plan exists with ID `plan-1`
**And** the plan has associated days and meals

**When** a coach or admin deletes the meal plan

**Then** the system should:
1. Find the meal plan
2. Handle cascade delete of days and meals
3. Remove the meal plan
4. Return success confirmation

**And** the plan should no longer be accessible

---

## Scenario: Create meal plan fails - Invalid date range

**Given** a coach attempts to create a meal plan
**And** the end date is before the start date

**When** the system validates the dates

**Then** the creation should fail
**And** an appropriate error should be returned

---

## Business Rules

### Meal Plan Structure
- **Label**: Plan name (required)
- **Slug**: Auto-generated from label
- **Locale**: Language for meal names and descriptions
- **User ID**: The client/athlete assigned to this plan
- **Date Range**: Start and end dates for the plan period
- **Total Calories**: Target daily calories (can be average or fixed)
- **Days**: Collection of daily meal schedules

### Day Structure  
- **Day Number**: 1-7 for weekly plans, 1-30 for monthly
- **Label**: Day name or designation
- **Total Calories**: Sum of all meals for this day
- **Meal Types**: Breakfast, lunch, dinner, snacks, etc.

### Meal Structure
- **Label**: Meal name/description
- **Calories**: Energy content
- **Macros**: Protein, carbs, fats (optional)
- **Ingredients**: List of food items (optional)
- **Instructions**: Preparation steps (optional)
- **Order**: Display order within meal type

### Slug Generation
- Auto-generated from label for plan, days, and meals
- Fallback slug is `meal-plan`, `day`, `meal` respectively
- Slug + locale combination should be unique for active plans

### Active Status
- `is_active`: Indicates if this is the current active plan
- Users typically have one active plan at a time
- Inactive plans are historical/archived

### Nutritional Tracking
- Calories tracked at meal, day, and plan level
- Macronutrients (protein, carbs, fats) optional
- Micronutrients can be added as needed

---

## CRUD Operations

### Create Meal Plan
- **Use Case**: `CreateMealPlanUsecase`
- **Authorization**: COACH, ADMIN
- **Auto-generation**: Slugs for plan, days, and meals
- **Validation**: Date range, user exists, calorie consistency

### Get Meal Plan
- **Use Case**: `GetMealPlanUsecase`
- **Authorization**: Owner ATHLETE, assigned COACH, ADMIN
- **Hydration**: Full nested structure with all meals
- **Returns**: Complete meal plan object

### List Meal Plans
- **Use Case**: `ListMealPlansUsecase`
- **Authorization**: COACH (own clients), ATHLETE (own), ADMIN (all)
- **Filters**: userId, is_active, date range, locale
- **Returns**: Array of meal plans with optional pagination

### Update Meal Plan
- **Use Case**: `UpdateMealPlanUsecase`
- **Authorization**: Creator COACH, ADMIN
- **Slug Update**: Re-generated if label changes
- **Returns**: Updated meal plan

### Delete Meal Plan
- **Use Case**: `DeleteMealPlanUsecase`
- **Authorization**: Creator COACH, ADMIN
- **Type**: Hard delete with cascade or soft delete

---

## GraphQL Operations

### Create Meal Plan
```graphql
mutation CreateMealPlan($input: CreateMealPlanInput!) {
  createMealPlan(input: $input) {
    id
    label
    slug
    userId
    startDate
    endDate
    totalCalories
    days {
      id
      dayNumber
      label
      totalCalories
    }
    is_active
    createdAt
  }
}
```

### Get Meal Plan
```graphql
query GetMealPlan($id: ID!) {
  getMealPlan(id: $id) {
    id
    label
    description
    startDate
    endDate
    days {
      dayNumber
      label
      mealTypes {
        type {
          label
        }
        meals {
          label
          calories
          ingredients
        }
      }
    }
  }
}
```

### List User's Meal Plans
```graphql
query ListMealPlans($userId: ID!, $is_active: Boolean) {
  listMealPlans(userId: $userId, is_active: $is_active) {
    id
    label
    startDate
    endDate
    totalCalories
    is_active
  }
}
```

---

## Related Features

### Meal Types
- Breakfast, Lunch, Dinner, Snacks, etc.
- Configurable categories for meal organization
- See `meal-type-management.md`

### Meal Days
- Individual day within a meal plan
- Can be reused across different plans
- See `meal-day-management.md`

### Meals
- Individual meal items
- Can include recipes, ingredients, prep time
- See `meal-management.md`

---

## Error Codes
- `CREATE_MEAL_PLAN_USECASE` - Failed to create meal plan
- `GET_MEAL_PLAN_USECASE` - Failed to retrieve meal plan  
- `UPDATE_MEAL_PLAN_USECASE` - Failed to update meal plan
- `DELETE_MEAL_PLAN_USECASE` - Failed to delete meal plan
- `MEAL_PLAN_NOT_FOUND` - Meal plan does not exist
- `INVALID_DATE_RANGE` - End date before start date
- `USER_NOT_FOUND` - Assigned user does not exist

// src/graphql/nutri/meal-record/meal-record.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { MealRecordStateEnum } from './meal-record.enum';

/**
 * GraphQL output model for meal records.
 */
@ObjectType()
export class MealRecordGql {
  @Field(() => ID) id!: string;
  @Field(() => ID) userId!: string;
  @Field(() => ID) mealPlanId!: string;
  @Field(() => ID) mealDayId!: string;
  @Field(() => ID) mealId!: string;
  @Field(() => MealRecordStateEnum) state!: MealRecordStateEnum;
  @Field(() => ID) createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => Date, { nullable: true }) deletedAt?: Date;
}

/**
 * GraphQL input model for creating a meal record.
 */
@InputType()
export class CreateMealRecordInput {
  @Field(() => ID, { nullable: true }) userId?: string;
  @Field(() => ID) mealPlanId!: string;
  @Field(() => ID) mealDayId!: string;
  @Field(() => ID) mealId!: string;
  @Field(() => MealRecordStateEnum, { nullable: true }) state?: MealRecordStateEnum;
}

/**
 * GraphQL input model for updating a meal record state.
 */
@InputType()
export class UpdateMealRecordInput {
  @Field(() => ID) id!: string;
  @Field(() => MealRecordStateEnum) state!: MealRecordStateEnum;
}

/**
 * GraphQL input model for listing meal records.
 */
@InputType()
export class ListMealRecordsInput {
  @Field(() => ID, { nullable: true }) userId?: string;
  @Field(() => ID, { nullable: true }) mealPlanId?: string;
  @Field(() => ID, { nullable: true }) mealDayId?: string;
  @Field(() => ID, { nullable: true }) mealId?: string;
  @Field(() => MealRecordStateEnum, { nullable: true }) state?: MealRecordStateEnum;
  @Field(() => Boolean, { nullable: true }) includeArchived?: boolean;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

/**
 * GraphQL list wrapper for meal records.
 */
@ObjectType()
export class MealRecordListGql {
  @Field(() => [MealRecordGql]) items!: MealRecordGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

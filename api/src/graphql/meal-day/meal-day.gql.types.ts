// src/graphql/meal-day/meal-day.gql.types.ts

import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { MealGql } from '@graphql/meal/meal.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';

export enum MealDayVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

registerEnumType(MealDayVisibility, { name: 'MealDayVisibility' });

@ObjectType()
export class MealDayGql {
  @Field(() => ID)
  id!: string;

  @Field()
  slug!: string;

  @Field()
  locale!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  description?: string;

  /** Ordered list of meal identifiers. */
  @Field(() => [ID])
  mealIds!: string[];

  @Field(() => MealDayVisibility)
  visibility!: MealDayVisibility;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;

  @Field(() => [MealGql], { nullable: true })
  meals?: MealGql[] | null;
}

@InputType()
export class CreateMealDayInput {
  @Field()
  slug!: string;

  @Field()
  locale!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [ID])
  mealIds!: string[];

  @Field(() => MealDayVisibility)
  visibility!: MealDayVisibility;
}

@InputType()
export class UpdateMealDayInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [ID], { nullable: true })
  mealIds?: string[];

  @Field(() => MealDayVisibility, { nullable: true })
  visibility?: MealDayVisibility;
}

@InputType()
export class ListMealDaysInput {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field(() => MealDayVisibility, { nullable: true })
  visibility?: MealDayVisibility;

  @Field({ nullable: true })
  createdBy?: string;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  page?: number;
}

@ObjectType()
export class MealDayListGql {
  @Field(() => [MealDayGql])
  items!: MealDayGql[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}


// src/graphql/meal/meal.gql.types.ts
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { MealTypeGql } from '@graphql/meal-type/meal-type.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';

export enum MealVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

registerEnumType(MealVisibility, { name: 'MealVisibility' });

@ObjectType()
/** GraphQL type describing a meal entity. */
export class MealGql {
  @Field(() => ID)
  id!: string;

  @Field()
  slug!: string;

  @Field()
  locale!: string;

  @Field()
  label!: string;

  @Field(() => ID)
  typeId!: string;

  @Field()
  foods!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  proteinGrams!: number;

  @Field(() => Int)
  carbGrams!: number;

  @Field(() => Int)
  fatGrams!: number;

  @Field(() => MealVisibility)
  visibility!: MealVisibility;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;

  @Field(() => MealTypeGql, { nullable: true })
  type?: MealTypeGql | null;
}

@InputType()
/** Input used to create a meal. */
export class CreateMealInput {
  @Field()
  slug!: string;

  @Field()
  locale!: string;

  @Field()
  label!: string;

  @Field(() => ID)
  typeId!: string;

  @Field()
  foods!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  proteinGrams!: number;

  @Field(() => Int)
  carbGrams!: number;

  @Field(() => Int)
  fatGrams!: number;

  @Field(() => MealVisibility)
  visibility!: MealVisibility;
}

@InputType()
/** Input used to update a meal. */
export class UpdateMealInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field({ nullable: true })
  label?: string;

  @Field(() => ID, { nullable: true })
  typeId?: string;

  @Field({ nullable: true })
  foods?: string;

  @Field(() => Int, { nullable: true })
  calories?: number;

  @Field(() => Int, { nullable: true })
  proteinGrams?: number;

  @Field(() => Int, { nullable: true })
  carbGrams?: number;

  @Field(() => Int, { nullable: true })
  fatGrams?: number;

  @Field(() => MealVisibility, { nullable: true })
  visibility?: MealVisibility;
}

@InputType()
/** Input used to filter and paginate meals. */
export class ListMealsInput {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field(() => ID, { nullable: true })
  typeId?: string;

  @Field({ nullable: true })
  createdBy?: string;

  @Field(() => MealVisibility, { nullable: true })
  visibility?: MealVisibility;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  page?: number;
}

@ObjectType()
/** GraphQL wrapper for paginated meal results. */
export class MealListGql {
  @Field(() => [MealGql])
  items!: MealGql[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}

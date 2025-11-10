// src/graphql/meal-type/meal-type.gql.types.ts
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum MealTypeVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

registerEnumType(MealTypeVisibility, { name: 'MealTypeVisibility' });

@ObjectType()
/** GraphQL type describing a meal type entity. */
export class MealTypeGql {
  @Field(() => ID)
  id!: string;

  @Field()
  slug!: string;

  @Field()
  locale!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  icon?: string | null;

  @Field(() => MealTypeVisibility)
  visibility!: MealTypeVisibility;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
/** Input used to create a meal type. */
export class CreateMealTypeInput {
  @Field()
  slug!: string;

  @Field()
  locale!: string;

  @Field()
  label!: string;

  @Field({ nullable: true })
  icon?: string | null;

  @Field(() => MealTypeVisibility)
  visibility!: MealTypeVisibility;
}

@InputType()
/** Input used to update a meal type. */
export class UpdateMealTypeInput {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field({ nullable: true })
  label?: string;

  @Field({ nullable: true })
  icon?: string | null;

  @Field(() => MealTypeVisibility, { nullable: true })
  visibility?: MealTypeVisibility;
}

@InputType()
/** Input used to filter and paginate meal types. */
export class ListMealTypesInput {
  @Field({ nullable: true })
  q?: string;

  @Field({ nullable: true })
  locale?: string;

  @Field({ nullable: true })
  createdBy?: string;

  @Field(() => MealTypeVisibility, { nullable: true })
  visibility?: MealTypeVisibility;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  page?: number;
}

@ObjectType()
/** GraphQL wrapper for paginated meal type results. */
export class MealTypeListGql {
  @Field(() => [MealTypeGql])
  items!: MealTypeGql[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}

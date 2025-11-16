// src/graphql/meal-plan/meal-plan.gql.types.ts
import {
  Field,
  GraphQLISODateTime,
  ID,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { MealTypeVisibility } from '@src/graphql/nutri/meal-type/meal-type.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';

export enum MealPlanVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(MealPlanVisibility, { name: 'MealPlanVisibility' });

@ObjectType()
export class MealPlanMealTypeSnapshotGql {
  @Field(() => ID, { nullable: true })
  id?: string | null;

  @Field(() => ID, { nullable: true })
  templateMealTypeId?: string | null;

  @Field(() => String, { nullable: true })
  slug?: string | null;

  @Field(() => String, { nullable: true })
  locale?: string | null;

  @Field(() => String)
  label!: string;

  @Field(() => MealTypeVisibility, { nullable: true })
  visibility?: MealTypeVisibility | null;
}

@ObjectType()
export class MealPlanMealSnapshotGql {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  templateMealId?: string | null;

  @Field(() => String, { nullable: true })
  slug?: string | null;

  @Field(() => String, { nullable: true })
  locale?: string | null;

  @Field(() => String)
  label!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  foods!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  proteinGrams!: number;

  @Field(() => Int)
  carbGrams!: number;

  @Field(() => Int)
  fatGrams!: number;

  @Field(() => MealPlanMealTypeSnapshotGql)
  type!: MealPlanMealTypeSnapshotGql;
}

@ObjectType()
export class MealPlanDaySnapshotGql {
  @Field(() => ID)
  id!: string;

  @Field(() => ID, { nullable: true })
  templateMealDayId?: string | null;

  @Field(() => String, { nullable: true })
  slug?: string | null;

  @Field(() => String, { nullable: true })
  locale?: string | null;

  @Field(() => String)
  label!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => [MealPlanMealSnapshotGql])
  meals!: MealPlanMealSnapshotGql[];
}

@ObjectType()
export class MealPlanGql {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  locale!: string;

  @Field(() => String)
  label!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => MealPlanVisibility)
  visibility!: MealPlanVisibility;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  proteinGrams!: number;

  @Field(() => Int)
  carbGrams!: number;

  @Field(() => Int)
  fatGrams!: number;

  @Field(() => [MealPlanDaySnapshotGql])
  days!: MealPlanDaySnapshotGql[];

  @Field(() => ID, { nullable: true })
  userId?: string | null;

  @Field(() => String)
  createdBy!: string;

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;

  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;

  @Field(() => UserGql, { nullable: true })
  athlete?: UserGql | null;
}

@InputType()
export class MealPlanMealTypeInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => ID, { nullable: true })
  templateMealTypeId?: string;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => String, { nullable: true })
  locale?: string;

  @Field(() => String)
  label!: string;

  @Field(() => MealTypeVisibility, { nullable: true })
  visibility?: MealTypeVisibility;
}

@InputType()
export class MealPlanMealInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => ID, { nullable: true })
  templateMealId?: string;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => String, { nullable: true })
  locale?: string;

  @Field(() => String)
  label!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  foods!: string;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  proteinGrams!: number;

  @Field(() => Int)
  carbGrams!: number;

  @Field(() => Int)
  fatGrams!: number;

  @Field(() => MealPlanMealTypeInput)
  type!: MealPlanMealTypeInput;
}

@InputType()
export class MealPlanDayInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => ID, { nullable: true })
  templateMealDayId?: string;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => String, { nullable: true })
  locale?: string;

  @Field(() => String)
  label!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => [MealPlanMealInput])
  meals!: MealPlanMealInput[];
}

@InputType()
export class CreateMealPlanInput {
  @Field(() => String, { nullable: true })
  slug?: string | null;

  @Field(() => String)
  locale!: string;

  @Field(() => String)
  label!: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => MealPlanVisibility, { nullable: true })
  visibility?: MealPlanVisibility;

  @Field(() => Int)
  calories!: number;

  @Field(() => Int)
  proteinGrams!: number;

  @Field(() => Int)
  carbGrams!: number;

  @Field(() => Int)
  fatGrams!: number;

  @Field(() => [MealPlanDayInput], { nullable: true })
  days?: MealPlanDayInput[];

  @Field(() => [ID], { nullable: true })
  dayIds?: string[];

  @Field(() => ID, { nullable: true })
  userId?: string | null;
}

@InputType()
export class UpdateMealPlanInput {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  slug?: string;

  @Field(() => String, { nullable: true })
  locale?: string;

  @Field(() => String, { nullable: true })
  label?: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => MealPlanVisibility, { nullable: true })
  visibility?: MealPlanVisibility;

  @Field(() => Int, { nullable: true })
  calories?: number;

  @Field(() => Int, { nullable: true })
  proteinGrams?: number;

  @Field(() => Int, { nullable: true })
  carbGrams?: number;

  @Field(() => Int, { nullable: true })
  fatGrams?: number;

  @Field(() => [MealPlanDayInput], { nullable: true })
  days?: MealPlanDayInput[];

  @Field(() => [ID], { nullable: true })
  dayIds?: string[];

  @Field(() => ID, { nullable: true })
  userId?: string | null;
}

@InputType()
export class ListMealPlansInput {
  @Field(() => String, { nullable: true })
  q?: string;

  @Field(() => String, { nullable: true })
  locale?: string;

  @Field(() => ID, { nullable: true })
  createdBy?: string;

  @Field(() => MealPlanVisibility, { nullable: true })
  visibility?: MealPlanVisibility;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => Int, { nullable: true })
  page?: number;
}

@ObjectType()
export class MealPlanListGql {
  @Field(() => [MealPlanGql])
  items!: MealPlanGql[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;
}

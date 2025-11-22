// src/graphql/category/category.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { registerVisibilityEnum, Visibility } from '@graphql/common/visibility.enum';
import { UserGql } from '@graphql/user/user.gql.types';

export const CategoryVisibility = Visibility;
export type CategoryVisibility = Visibility;

registerVisibilityEnum('CategoryVisibility');

@ObjectType()
export class CategoryGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => CategoryVisibility) visibility!: CategoryVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateCategoryInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => CategoryVisibility) visibility!: CategoryVisibility;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => CategoryVisibility, { nullable: true }) visibility?: CategoryVisibility;
}

@InputType()
export class ListCategoriesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => CategoryVisibility, { nullable: true }) visibility?: CategoryVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class CategoryListGql {
  @Field(() => [CategoryGql]) items!: CategoryGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

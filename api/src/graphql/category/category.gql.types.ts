// src/graphql/category/category.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum CategoryVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(CategoryVisibility, { name: 'CategoryVisibility' });

@ObjectType()
export class CategoryGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field(() => CategoryVisibility) visibility!: CategoryVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateCategoryInput {
  @Field() slug!: string;
  @Field() locale!: string;
  @Field(() => CategoryVisibility) visibility!: CategoryVisibility;
}

@InputType()
export class UpdateCategoryInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
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

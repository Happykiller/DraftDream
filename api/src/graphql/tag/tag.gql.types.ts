// src/graphql/tag/tag.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { registerVisibilityEnum, Visibility } from '@graphql/common/visibility.enum';
import { UserGql } from '@graphql/user/user.gql.types';

export const TagVisibility = Visibility;
export type TagVisibility = Visibility;

registerVisibilityEnum('TagVisibility');

@ObjectType()
export class TagGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => TagVisibility) visibility!: TagVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateTagInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => TagVisibility) visibility!: TagVisibility;
}

@InputType()
export class UpdateTagInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => TagVisibility, { nullable: true }) visibility?: TagVisibility;
}

@InputType()
export class ListTagsInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => TagVisibility, { nullable: true }) visibility?: TagVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class TagListGql {
  @Field(() => [TagGql]) items!: TagGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

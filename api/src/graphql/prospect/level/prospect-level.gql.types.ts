// src/graphql/prospect/level/prospect-level.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { registerVisibilityEnum, Visibility as ProspectLevelVisibility } from '@graphql/common/visibility.enum';
export { ProspectLevelVisibility };
import { UserGql } from '@graphql/user/user.gql.types';



registerVisibilityEnum('ProspectLevelVisibility');

@ObjectType()
export class ProspectLevelGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectLevelVisibility) visibility!: ProspectLevelVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateProspectLevelInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectLevelVisibility) visibility!: ProspectLevelVisibility;
}

@InputType()
export class UpdateProspectLevelInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ProspectLevelVisibility, { nullable: true }) visibility?: ProspectLevelVisibility;
}

@InputType()
export class ListProspectLevelsInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ProspectLevelVisibility, { nullable: true }) visibility?: ProspectLevelVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ProspectLevelListGql {
  @Field(() => [ProspectLevelGql]) items!: ProspectLevelGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

// src/graphql/prospect/objective/prospect-objective.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { registerVisibilityEnum, Visibility } from '@graphql/common/visibility.enum';
import { UserGql } from '@graphql/user/user.gql.types';

export const ProspectObjectiveVisibility = Visibility;
export type ProspectObjectiveVisibility = Visibility;

registerVisibilityEnum('ProspectObjectiveVisibility');

@ObjectType()
export class ProspectObjectiveGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectObjectiveVisibility) visibility!: ProspectObjectiveVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateProspectObjectiveInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectObjectiveVisibility) visibility!: ProspectObjectiveVisibility;
}

@InputType()
export class UpdateProspectObjectiveInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ProspectObjectiveVisibility, { nullable: true }) visibility?: ProspectObjectiveVisibility;
}

@InputType()
export class ListProspectObjectivesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ProspectObjectiveVisibility, { nullable: true }) visibility?: ProspectObjectiveVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ProspectObjectiveListGql {
  @Field(() => [ProspectObjectiveGql]) items!: ProspectObjectiveGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

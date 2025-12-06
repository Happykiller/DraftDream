// src/graphql/athlete/athlete-info/athlete-info.gql.types.ts
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { ProspectActivityPreferenceGql } from '@graphql/prospect/activity-preference/prospect-activity-preference.gql.types';
import { ProspectLevelGql } from '@graphql/prospect/level/prospect-level.gql.types';
import { ProspectObjectiveGql } from '@graphql/prospect/objective/prospect-objective.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';

@ObjectType()
export class AthleteInfoGql {
  @Field(() => ID) id!: string;
  @Field(() => ID) userId!: string;
  @Field(() => ID, { nullable: true }) levelId?: string;
  @Field(() => [ID]) objectiveIds!: string[];
  @Field(() => [ID]) activityPreferenceIds!: string[];
  @Field({ nullable: true }) medicalConditions?: string;
  @Field({ nullable: true }) allergies?: string;
  @Field({ nullable: true }) notes?: string;
  @Field(() => ID) createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field({ nullable: true }) deletedAt?: Date;
  @Field(() => Int) schemaVersion!: number;

  @Field(() => UserGql, { nullable: true }) athlete?: UserGql | null;
  @Field(() => UserGql, { nullable: true }) creator?: UserGql | null;
  @Field(() => ProspectLevelGql, { nullable: true }) level?: ProspectLevelGql | null;
  @Field(() => [ProspectObjectiveGql]) objectives!: ProspectObjectiveGql[];
  @Field(() => [ProspectActivityPreferenceGql]) activityPreferences!: ProspectActivityPreferenceGql[];
}

@InputType('CreateAthleteInfoInput')
export class CreateAthleteInfoInput {
  @Field(() => ID) userId!: string;
  @Field(() => ID, { nullable: true }) levelId?: string;
  @Field(() => [ID], { nullable: true }) objectiveIds?: string[];
  @Field(() => [ID], { nullable: true }) activityPreferenceIds?: string[];
  @Field({ nullable: true }) medicalConditions?: string;
  @Field({ nullable: true }) allergies?: string;
  @Field({ nullable: true }) notes?: string;
}

@InputType('UpdateAthleteInfoInput')
export class UpdateAthleteInfoInput {
  @Field(() => ID) id!: string;
  @Field(() => ID, { nullable: true }) userId?: string;
  @Field(() => ID, { nullable: true }) levelId?: string;
  @Field(() => [ID], { nullable: true }) objectiveIds?: string[];
  @Field(() => [ID], { nullable: true }) activityPreferenceIds?: string[];
  @Field({ nullable: true }) medicalConditions?: string;
  @Field({ nullable: true }) allergies?: string;
  @Field({ nullable: true }) notes?: string;
}

@InputType('ListAthleteInfosInput')
export class ListAthleteInfosInput {
  @Field(() => ID, { nullable: true }) userId?: string;
  @Field(() => ID, { nullable: true }) createdBy?: string;
  @Field({ nullable: true }) includeArchived?: boolean;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class AthleteInfoListGql {
  @Field(() => [AthleteInfoGql]) items!: AthleteInfoGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

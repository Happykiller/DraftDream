// src/graphql/prospect/prospect/prospect.gql.types.ts
import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';
import { ProspectLevelGql } from '@graphql/prospect/level/prospect-level.gql.types';
import { ProspectObjectiveGql } from '@graphql/prospect/objective/prospect-objective.gql.types';
import { ProspectActivityPreferenceGql } from '@graphql/prospect/activity-preference/prospect-activity-preference.gql.types';
import { ProspectSourceGql } from '@graphql/prospect/source/prospect-source.gql.types';
import { ProspectStatusEnum } from './prospect.enum';

@ObjectType()
export class ProspectGql {
  @Field(() => ID) id!: string;
  @Field() firstName!: string;
  @Field() lastName!: string;
  @Field() email!: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => ProspectStatusEnum, { nullable: true }) status?: ProspectStatusEnum;
  @Field({ nullable: true }) levelId?: string;
  @Field(() => [ID]) objectiveIds!: string[];
  @Field(() => [ID]) activityPreferenceIds!: string[];
  @Field({ nullable: true }) medicalConditions?: string;
  @Field({ nullable: true }) allergies?: string;
  @Field({ nullable: true }) notes?: string;
  @Field({ nullable: true }) sourceId?: string;
  @Field(() => Float, { nullable: true }) budget?: number;
  @Field({ nullable: true }) dealDescription?: string;
  @Field({ nullable: true }) desiredStartDate?: Date;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;

  @Field(() => UserGql, { nullable: true }) creator?: UserGql | null;
  @Field(() => ProspectLevelGql, { nullable: true }) level?: ProspectLevelGql | null;
  @Field(() => ProspectSourceGql, { nullable: true }) source?: ProspectSourceGql | null;
  @Field(() => [ProspectObjectiveGql], { nullable: 'itemsAndList' })
  objectives?: ProspectObjectiveGql[];
  @Field(() => [ProspectActivityPreferenceGql], { nullable: 'itemsAndList' })
  activityPreferences?: ProspectActivityPreferenceGql[];
}

@InputType()
export class CreateProspectInput {
  @Field() firstName!: string;
  @Field() lastName!: string;
  @Field() email!: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => ProspectStatusEnum, { nullable: true }) status?: ProspectStatusEnum;
  @Field({ nullable: true }) levelId?: string;
  @Field(() => [ID], { nullable: true }) objectiveIds?: string[];
  @Field(() => [ID], { nullable: true }) activityPreferenceIds?: string[];
  @Field({ nullable: true }) medicalConditions?: string;
  @Field({ nullable: true }) allergies?: string;
  @Field({ nullable: true }) notes?: string;
  @Field({ nullable: true }) sourceId?: string;
  @Field(() => Float, { nullable: true }) budget?: number;
  @Field({ nullable: true }) dealDescription?: string;
  @Field({ nullable: true }) desiredStartDate?: Date;
}

@InputType()
export class UpdateProspectInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) firstName?: string;
  @Field({ nullable: true }) lastName?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => ProspectStatusEnum, { nullable: true }) status?: ProspectStatusEnum;
  @Field({ nullable: true }) levelId?: string;
  @Field(() => [ID], { nullable: true }) objectiveIds?: string[];
  @Field(() => [ID], { nullable: true }) activityPreferenceIds?: string[];
  @Field({ nullable: true }) medicalConditions?: string;
  @Field({ nullable: true }) allergies?: string;
  @Field({ nullable: true }) notes?: string;
  @Field({ nullable: true }) sourceId?: string;
  @Field(() => Float, { nullable: true }) budget?: number;
  @Field({ nullable: true }) dealDescription?: string;
  @Field({ nullable: true }) desiredStartDate?: Date;
}

@InputType()
export class ListProspectsInput {
  @Field({ nullable: true }) q?: string;
  @Field(() => ProspectStatusEnum, { nullable: true }) status?: ProspectStatusEnum;
  @Field({ nullable: true }) levelId?: string;
  @Field({ nullable: true }) sourceId?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ProspectListGql {
  @Field(() => [ProspectGql]) items!: ProspectGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

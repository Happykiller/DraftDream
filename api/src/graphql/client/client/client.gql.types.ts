// src/graphql/client/client/client.gql.types.ts
import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';
import { ClientStatusGql } from '@graphql/client/status/client-status.gql.types';
import { ClientLevelGql } from '@graphql/client/level/client-level.gql.types';
import { ClientObjectiveGql } from '@graphql/client/objective/client-objective.gql.types';
import { ClientActivityPreferenceGql } from '@graphql/client/activity-preference/client-activity-preference.gql.types';
import { ClientSourceGql } from '@graphql/client/source/client-source.gql.types';

@ObjectType()
export class ClientGql {
  @Field(() => ID) id!: string;
  @Field() firstName!: string;
  @Field() lastName!: string;
  @Field() email!: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) statusId?: string;
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
  @Field(() => ClientStatusGql, { nullable: true }) status?: ClientStatusGql | null;
  @Field(() => ClientLevelGql, { nullable: true }) level?: ClientLevelGql | null;
  @Field(() => ClientSourceGql, { nullable: true }) source?: ClientSourceGql | null;
  @Field(() => [ClientObjectiveGql], { nullable: 'itemsAndList' })
  objectives?: ClientObjectiveGql[];
  @Field(() => [ClientActivityPreferenceGql], { nullable: 'itemsAndList' })
  activityPreferences?: ClientActivityPreferenceGql[];
}

@InputType()
export class CreateClientInput {
  @Field() firstName!: string;
  @Field() lastName!: string;
  @Field() email!: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) statusId?: string;
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
export class UpdateClientInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) firstName?: string;
  @Field({ nullable: true }) lastName?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) phone?: string;
  @Field({ nullable: true }) statusId?: string;
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
export class ListClientsInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) statusId?: string;
  @Field({ nullable: true }) levelId?: string;
  @Field({ nullable: true }) sourceId?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ClientListGql {
  @Field(() => [ClientGql]) items!: ClientGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

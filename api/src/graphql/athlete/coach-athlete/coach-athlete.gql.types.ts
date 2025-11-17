// src/graphql/athlete/coach-athlete/coach-athlete.gql.types.ts
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

/** GraphQL object representing a coach-athlete relation. */
@ObjectType()
export class CoachAthleteGql {
  @Field(() => ID) id!: string;
  @Field(() => ID) coachId!: string;
  @Field(() => ID) athleteId!: string;
  @Field() startDate!: Date;
  @Field({ nullable: true }) endDate?: Date;
  @Field() is_active!: boolean;
  @Field({ nullable: true }) note?: string;
  @Field(() => ID) createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field({ nullable: true }) deletedAt?: Date;

  @Field(() => UserGql, { nullable: true }) coach?: UserGql | null;
  @Field(() => UserGql, { nullable: true }) athlete?: UserGql | null;
}

/** Input payload used when creating a relation. */
@InputType('CreateCoachAthleteInput')
export class CreateCoachAthleteInput {
  @Field(() => ID) coachId!: string;
  @Field(() => ID) athleteId!: string;
  @Field() startDate!: Date;
  @Field({ nullable: true }) endDate?: Date;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) is_active?: boolean;
}

/** Input payload used when updating a relation. */
@InputType('UpdateCoachAthleteInput')
export class UpdateCoachAthleteInput {
  @Field(() => ID) id!: string;
  @Field(() => ID, { nullable: true }) coachId?: string;
  @Field(() => ID, { nullable: true }) athleteId?: string;
  @Field({ nullable: true }) startDate?: Date;
  @Field({ nullable: true }) endDate?: Date;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) is_active?: boolean;
}

/** Filters used when listing relations. */
@InputType('ListCoachAthletesInput')
export class ListCoachAthletesInput {
  @Field(() => ID, { nullable: true }) coachId?: string;
  @Field(() => ID, { nullable: true }) athleteId?: string;
  @Field({ nullable: true }) is_active?: boolean;
  @Field(() => ID, { nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
  @Field({ nullable: true }) includeArchived?: boolean;
}

/** Paginated list returned by the coach-athlete list query. */
@ObjectType()
export class CoachAthleteListGql {
  @Field(() => [CoachAthleteGql]) items!: CoachAthleteGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

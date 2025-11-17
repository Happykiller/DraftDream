// src/graphql/athlete/coach-athlete/coach-athlete.gql.types.ts
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

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

  @Field(() => UserGql, { nullable: true }) coach?: UserGql | null;
  @Field(() => UserGql, { nullable: true }) athlete?: UserGql | null;
}

@InputType()
export class CreateCoachAthleteInput {
  @Field(() => ID) coachId!: string;
  @Field(() => ID) athleteId!: string;
  @Field() startDate!: Date;
  @Field({ nullable: true }) endDate?: Date;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) is_active?: boolean;
}

@InputType()
export class UpdateCoachAthleteInput {
  @Field(() => ID) id!: string;
  @Field(() => ID, { nullable: true }) coachId?: string;
  @Field(() => ID, { nullable: true }) athleteId?: string;
  @Field({ nullable: true }) startDate?: Date;
  @Field({ nullable: true }) endDate?: Date;
  @Field({ nullable: true }) note?: string;
  @Field({ nullable: true }) is_active?: boolean;
}

@InputType()
export class ListCoachAthletesInput {
  @Field(() => ID, { nullable: true }) coachId?: string;
  @Field(() => ID, { nullable: true }) athleteId?: string;
  @Field({ nullable: true }) is_active?: boolean;
  @Field(() => ID, { nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class CoachAthleteListGql {
  @Field(() => [CoachAthleteGql]) items!: CoachAthleteGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

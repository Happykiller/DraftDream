import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { TagGql } from '@graphql/tag/tag.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';

@ObjectType()
export class DailyReportGql {
  @Field(() => ID) id!: string;
  @Field() reportDate!: string;
  @Field() trainingDone!: boolean;
  @Field(() => Int) nutritionPlanCompliance!: number;
  @Field() nutritionDeviations!: boolean;
  @Field(() => Int) mealCount!: number;
  @Field(() => Int) hydrationLiters!: number;
  @Field() cravingsSnacking!: boolean;
  @Field() digestiveDiscomfort!: boolean;
  @Field() transitOk!: boolean;
  @Field() menstruation!: boolean;
  @Field(() => Int) sleepHours!: number;
  @Field(() => Int) sleepQuality!: number;
  @Field() wakeRested!: boolean;
  @Field() muscleSoreness!: boolean;
  @Field() waterRetention!: boolean;
  @Field(() => Int) energyLevel!: number;
  @Field(() => Int) motivationLevel!: number;
  @Field(() => Int) stressLevel!: number;
  @Field(() => Int) moodLevel!: number;
  @Field() disruptiveFactor!: boolean;
  @Field(() => [String]) painZones!: string[];
  @Field({ nullable: true }) notes?: string;
  @Field(() => ID) athleteId!: string;
  @Field(() => ID) createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field({ nullable: true }) deletedAt?: Date;

  @Field(() => UserGql, { nullable: true }) athlete?: UserGql | null;
  @Field(() => UserGql, { nullable: true }) creator?: UserGql | null;
}

@InputType()
export class CreateDailyReportInput {
  @Field({ nullable: true }) reportDate?: string;
  @Field() trainingDone!: boolean;
  @Field(() => Int) nutritionPlanCompliance!: number;
  @Field() nutritionDeviations!: boolean;
  @Field(() => Int) mealCount!: number;
  @Field(() => Int) hydrationLiters!: number;
  @Field() cravingsSnacking!: boolean;
  @Field() digestiveDiscomfort!: boolean;
  @Field() transitOk!: boolean;
  @Field() menstruation!: boolean;
  @Field(() => Int) sleepHours!: number;
  @Field(() => Int) sleepQuality!: number;
  @Field() wakeRested!: boolean;
  @Field() muscleSoreness!: boolean;
  @Field() waterRetention!: boolean;
  @Field(() => Int) energyLevel!: number;
  @Field(() => Int) motivationLevel!: number;
  @Field(() => Int) stressLevel!: number;
  @Field(() => Int) moodLevel!: number;
  @Field() disruptiveFactor!: boolean;
  @Field(() => [String]) painZones!: string[];
  @Field({ nullable: true }) notes?: string;
  @Field(() => ID, { nullable: true }) athleteId?: string;
}

@InputType()
export class UpdateDailyReportInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) reportDate?: string;
  @Field({ nullable: true }) trainingDone?: boolean;
  @Field(() => Int, { nullable: true }) nutritionPlanCompliance?: number;
  @Field({ nullable: true }) nutritionDeviations?: boolean;
  @Field(() => Int, { nullable: true }) mealCount?: number;
  @Field(() => Int, { nullable: true }) hydrationLiters?: number;
  @Field({ nullable: true }) cravingsSnacking?: boolean;
  @Field({ nullable: true }) digestiveDiscomfort?: boolean;
  @Field({ nullable: true }) transitOk?: boolean;
  @Field({ nullable: true }) menstruation?: boolean;
  @Field(() => Int, { nullable: true }) sleepHours?: number;
  @Field(() => Int, { nullable: true }) sleepQuality?: number;
  @Field({ nullable: true }) wakeRested?: boolean;
  @Field({ nullable: true }) muscleSoreness?: boolean;
  @Field({ nullable: true }) waterRetention?: boolean;
  @Field(() => Int, { nullable: true }) energyLevel?: number;
  @Field(() => Int, { nullable: true }) motivationLevel?: number;
  @Field(() => Int, { nullable: true }) stressLevel?: number;
  @Field(() => Int, { nullable: true }) moodLevel?: number;
  @Field({ nullable: true }) disruptiveFactor?: boolean;
  @Field(() => [String], { nullable: true }) painZones?: string[];
  @Field({ nullable: true }) notes?: string;
}

@InputType()
export class ListDailyReportsInput {
  @Field(() => ID, { nullable: true }) athleteId?: string;
  @Field(() => ID, { nullable: true }) createdBy?: string;
  @Field({ nullable: true }) reportDate?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class DailyReportListGql {
  @Field(() => [DailyReportGql]) items!: DailyReportGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

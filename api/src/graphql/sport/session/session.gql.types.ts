// src\graphql\session\session.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { UserGql } from '@graphql/user/user.gql.types';

@ObjectType()
export class SessionExerciseSummaryGql {
  @Field(() => ID)
  id!: string;

  @Field()
  label!: string;
}

@ObjectType()
export class SessionSportGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;

  @Field() label!: string;
  @Field(() => Int) durationMin!: number;
  @Field({ nullable: true }) description?: string;

  /** Ordered list of exercise IDs */
  @Field(() => [ID]) exerciseIds!: string[];

  @Field(() => [SessionExerciseSummaryGql])
  exercises!: SessionExerciseSummaryGql[];

  // Ownership
  @Field() createdBy!: string;

  // Audit
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;

  // Relations (resolved lazily)
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;

  @Field()
  visibility!: string;
}

@InputType()
export class CreateSessionInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => Int) durationMin!: number;
  @Field({ nullable: true }) description?: string;
  @Field(() => [ID]) exerciseIds!: string[];
}

@InputType()
export class UpdateSessionInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => Int, { nullable: true }) durationMin?: number;
  @Field({ nullable: true }) visibility?: string;
  @Field({ nullable: true }) description?: string;
  /** Replace the whole ordered list */
  @Field(() => [ID], { nullable: true }) exerciseIds?: string[];
}

@InputType()
export class ListSessionsInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class SessionListGql {
  @Field(() => [SessionSportGql]) items!: SessionSportGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

// src\\graphql\\program\\program.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { SessionSportGql } from '@graphql/session/session.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';

@ObjectType()
export class ProgramGql {
  @Field(() => ID) id!: string;
  @Field() name!: string;
  @Field(() => Int) duration!: number;
  @Field(() => Int) frequency!: number;
  @Field({ nullable: true }) description?: string;
  /** Ordered list of session IDs */
  @Field(() => [ID]) sessionIds!: string[];

  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;

  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;

  @Field(() => [SessionSportGql])
  sessions?: SessionSportGql[];
}

@InputType()
export class CreateProgramInput {
  @Field() name!: string;
  @Field(() => Int) duration!: number;
  @Field(() => Int) frequency!: number;
  @Field({ nullable: true }) description?: string;
  @Field(() => [ID]) sessionIds!: string[];
}

@InputType()
export class UpdateProgramInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) name?: string;
  @Field(() => Int, { nullable: true }) duration?: number;
  @Field(() => Int, { nullable: true }) frequency?: number;
  @Field({ nullable: true }) description?: string;
  /** Replace the whole ordered list */
  @Field(() => [ID], { nullable: true }) sessionIds?: string[];
}

@InputType()
export class ListProgramsInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ProgramListGql {
  @Field(() => [ProgramGql]) items!: ProgramGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

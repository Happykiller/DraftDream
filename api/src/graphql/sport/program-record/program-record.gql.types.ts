// src/graphql/sport/program-record/program-record.gql.types.ts
import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { ProgramRecordStateEnum } from './program-record.enum';
import { ProgramSessionGql } from '@graphql/sport/program/program.gql.types';

@ObjectType()
export class ProgramRecordGql {
  @Field(() => ID) id!: string;
  @Field(() => ID) userId!: string;
  @Field(() => ID) programId!: string;
  @Field(() => String) sessionId!: string;
  @Field(() => ProgramSessionGql, { nullable: true }) sessionSnapshot?: ProgramSessionGql | null;
  @Field(() => ProgramRecordDataGql, { nullable: true }) recordData?: ProgramRecordDataGql | null;
  @Field(() => String, { nullable: true }) comment?: string;
  @Field(() => Int, { nullable: true }) satisfactionRating?: number;
  @Field(() => Int, { nullable: true }) durationMinutes?: number;
  @Field(() => Int, { nullable: true }) difficultyRating?: number;
  @Field(() => ProgramRecordStateEnum) state!: ProgramRecordStateEnum;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}

@ObjectType()
export class ProgramRecordExerciseSetDataGql {
  @Field(() => Int) index!: number;
  @Field(() => String, { nullable: true }) repetitions?: string;
  @Field(() => String, { nullable: true }) charge?: string;
  @Field(() => Float, { nullable: true }) rpe?: number;
  @Field(() => Boolean, { nullable: true }) done?: boolean;
}

@ObjectType()
export class ProgramRecordExerciseRecordDataGql {
  @Field(() => ID) exerciseId!: string;
  @Field(() => String, { nullable: true }) notes?: string;
  @Field(() => [ProgramRecordExerciseSetDataGql]) sets!: ProgramRecordExerciseSetDataGql[];
}

@ObjectType()
export class ProgramRecordDataGql {
  @Field(() => [ProgramRecordExerciseRecordDataGql]) exercises!: ProgramRecordExerciseRecordDataGql[];
}

@InputType()
export class ProgramRecordExerciseSetDataInput {
  @Field(() => Int) index!: number;
  @Field(() => String, { nullable: true }) repetitions?: string;
  @Field(() => String, { nullable: true }) charge?: string;
  @Field(() => Float, { nullable: true }) rpe?: number;
  @Field(() => Boolean, { nullable: true }) done?: boolean;
}

@InputType()
export class ProgramRecordExerciseRecordDataInput {
  @Field(() => ID) exerciseId!: string;
  @Field(() => String, { nullable: true }) notes?: string;
  @Field(() => [ProgramRecordExerciseSetDataInput]) sets!: ProgramRecordExerciseSetDataInput[];
}

@InputType()
export class ProgramRecordDataInput {
  @Field(() => [ProgramRecordExerciseRecordDataInput]) exercises!: ProgramRecordExerciseRecordDataInput[];
}

@InputType()
export class CreateProgramRecordInput {
  @Field(() => ID) programId!: string;
  @Field(() => String) sessionId!: string;
  @Field(() => ID, { nullable: true }) userId?: string;
  @Field(() => ProgramRecordStateEnum, { nullable: true }) state?: ProgramRecordStateEnum;
  @Field(() => ProgramRecordDataInput, { nullable: true }) recordData?: ProgramRecordDataInput;
  @Field(() => String, { nullable: true }) comment?: string;
  @Field(() => Int, { nullable: true }) satisfactionRating?: number;
  @Field(() => Int, { nullable: true }) durationMinutes?: number;
  @Field(() => Int, { nullable: true }) difficultyRating?: number;
}

@InputType()
export class UpdateProgramRecordInput {
  @Field(() => ID) id!: string;
  @Field(() => ProgramRecordStateEnum) state!: ProgramRecordStateEnum;
  @Field(() => ProgramRecordDataInput, { nullable: true }) recordData?: ProgramRecordDataInput;
  @Field(() => String, { nullable: true }) comment?: string;
  @Field(() => Int, { nullable: true }) satisfactionRating?: number;
  @Field(() => Int, { nullable: true }) durationMinutes?: number;
  @Field(() => Int, { nullable: true }) difficultyRating?: number;
}

@InputType()
export class ListProgramRecordsInput {
  @Field(() => ID, { nullable: true }) userId?: string;
  @Field(() => ID, { nullable: true }) programId?: string;
  @Field(() => String, { nullable: true }) sessionId?: string;
  @Field(() => ProgramRecordStateEnum, { nullable: true }) state?: ProgramRecordStateEnum;
  @Field({ nullable: true }) includeArchived?: boolean;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ProgramRecordListGql {
  @Field(() => [ProgramRecordGql]) items!: ProgramRecordGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

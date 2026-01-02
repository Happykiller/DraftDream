// src/graphql/sport/program-record/program-record.gql.types.ts
import {
  Field,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { ProgramRecordStateEnum } from './program-record.enum';

@ObjectType()
export class ProgramRecordGql {
  @Field(() => ID) id!: string;
  @Field(() => ID) userId!: string;
  @Field(() => ID) programId!: string;
  @Field(() => String) sessionId!: string;
  @Field(() => String, { nullable: true }) comment?: string;
  @Field(() => Int, { nullable: true }) satisfactionRating?: number;
  @Field(() => ProgramRecordStateEnum) state!: ProgramRecordStateEnum;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}

@InputType()
export class CreateProgramRecordInput {
  @Field(() => ID) programId!: string;
  @Field(() => String) sessionId!: string;
  @Field(() => ID, { nullable: true }) userId?: string;
  @Field(() => ProgramRecordStateEnum, { nullable: true }) state?: ProgramRecordStateEnum;
  @Field(() => String, { nullable: true }) comment?: string;
  @Field(() => Int, { nullable: true }) satisfactionRating?: number;
}

@InputType()
export class UpdateProgramRecordInput {
  @Field(() => ID) id!: string;
  @Field(() => ProgramRecordStateEnum) state!: ProgramRecordStateEnum;
  @Field(() => String, { nullable: true }) comment?: string;
  @Field(() => Int, { nullable: true }) satisfactionRating?: number;
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

// src\\graphql\\program\\program.gql.types.ts
import {
  Field,
  Float,
  ID,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';

import { CategoryGql } from '@graphql/category/category.gql.types';
import { EquipmentGql } from '@graphql/equipment/equipment.gql.types';
import { MuscleGql } from '@graphql/muscle/muscle.gql.types';
import { TagGql } from '@graphql/tag/tag.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';

@ObjectType()
export class ProgramSessionExerciseGql {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) templateExerciseId?: string;
  @Field() label!: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) instructions?: string;
  @Field({ nullable: true }) series?: string;
  @Field({ nullable: true }) repetitions?: string;
  @Field({ nullable: true }) charge?: string;
  @Field(() => Float, { nullable: true }) restSeconds?: number;
  @Field({ nullable: true }) videoUrl?: string;
  @Field({ nullable: true }) level?: string;
  @Field(() => [ID], { nullable: true }) categoryIds?: string[];
  @Field(() => [ID], { nullable: true }) muscleIds?: string[];
  @Field(() => [ID], { nullable: true }) equipmentIds?: string[];
  @Field(() => [ID], { nullable: true }) tagIds?: string[];

  @Field(() => [CategoryGql])
  categories?: CategoryGql[];
  @Field(() => [MuscleGql])
  muscles?: MuscleGql[];
  @Field(() => [EquipmentGql], { nullable: true })
  equipments?: EquipmentGql[] | null;
  @Field(() => [TagGql], { nullable: true })
  tags?: TagGql[] | null;
}

@ObjectType()
export class ProgramSessionGql {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) templateSessionId?: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field() label!: string;
  @Field(() => Int) durationMin!: number;
  @Field({ nullable: true }) description?: string;
  @Field(() => [ProgramSessionExerciseGql]) exercises!: ProgramSessionExerciseGql[];
}

@ObjectType()
export class ProgramGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => Int) duration!: number;
  @Field(() => Int) frequency!: number;
  @Field({ nullable: true }) description?: string;
  /** Snapshot definition available directly from the program document. */
  @Field(() => [ProgramSessionGql]) sessions!: ProgramSessionGql[];

  @Field({ nullable: true }) userId?: string;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;

  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;

  @Field(() => UserGql, { nullable: true })
  athlete?: UserGql | null;
}

@InputType()
export class ProgramSessionExerciseInput {
  @Field({ nullable: true }) id?: string;
  @Field({ nullable: true }) templateExerciseId?: string;
  @Field() label!: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) instructions?: string;
  @Field({ nullable: true }) series?: string;
  @Field({ nullable: true }) repetitions?: string;
  @Field({ nullable: true }) charge?: string;
  @Field(() => Float, { nullable: true }) restSeconds?: number;
  @Field({ nullable: true }) videoUrl?: string;
  @Field({ nullable: true }) level?: string;
  @Field(() => [ID], { nullable: true }) categoryIds?: string[];
  @Field(() => [ID], { nullable: true }) muscleIds?: string[];
  @Field(() => [ID], { nullable: true }) equipmentIds?: string[];
  @Field(() => [ID], { nullable: true }) tagIds?: string[];
}

@InputType()
export class ProgramSessionInput {
  @Field({ nullable: true }) id?: string;
  @Field({ nullable: true }) templateSessionId?: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field() label!: string;
  @Field(() => Int) durationMin!: number;
  @Field({ nullable: true }) description?: string;
  @Field(() => [ProgramSessionExerciseInput]) exercises!: ProgramSessionExerciseInput[];
}

@InputType()
export class CreateProgramInput {
  @Field({ nullable: true }) slug?: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => Int) duration!: number;
  @Field(() => Int) frequency!: number;
  @Field({ nullable: true }) description?: string;
  @Field(() => [ID], { nullable: true, description: 'Deprecated: use sessions instead.' })
  sessionIds?: string[];
  @Field(() => [ProgramSessionInput], { nullable: true }) sessions?: ProgramSessionInput[];
  /** Optional assigned user id */
  @Field({ nullable: true }) userId?: string;
}

@InputType()
export class UpdateProgramInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => Int, { nullable: true }) duration?: number;
  @Field(() => Int, { nullable: true }) frequency?: number;
  @Field({ nullable: true }) description?: string;
  /** Replace the whole ordered list */
  @Field(() => [ID], { nullable: true, description: 'Deprecated: use sessions instead.' })
  sessionIds?: string[];
  /** Replace the complete snapshot definition. */
  @Field(() => [ProgramSessionInput], { nullable: true }) sessions?: ProgramSessionInput[];
  /** Set/replace the assigned user id */
  @Field({ nullable: true }) userId?: string;
}

@InputType()
export class ListProgramsInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field({ nullable: true }) userId?: string;
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

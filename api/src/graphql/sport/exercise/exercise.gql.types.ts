// src/graphql/exercise/exercise.gql.types.ts
import { CategoryGql } from '@graphql/sport/category/category.gql.types';
import { EquipmentGql } from '@src/graphql/sport/equipment/equipment.gql.types';
import { MuscleGql } from '@src/graphql/sport/muscle/muscle.gql.types';
import { TagGql } from '@graphql/tag/tag.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ExerciseVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(ExerciseVisibility, { name: 'ExerciseVisibility' });

@ObjectType()
export class ExerciseGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) instructions?: string;
  @Field() series!: string;
  @Field() repetitions!: string;
  @Field({ nullable: true }) charge?: string;
  @Field(() => Int, { nullable: true }) rest?: number;
  @Field({ nullable: true }) videoUrl?: string;
  @Field(() => ExerciseVisibility) visibility!: ExerciseVisibility;
  @Field(() => [ID]) categoryIds!: string[];
  @Field(() => [ID]) muscleIds!: string[];
  @Field(() => [ID], { nullable: true }) equipmentIds?: string[];
  @Field(() => [ID], { nullable: true }) tagIds?: string[];

  // Ownership
  @Field() createdBy!: string;

  // Audit
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;

  // Relations (resolved lazily)
  @Field(() => [CategoryGql])
  categories?: CategoryGql[];
  @Field(() => [MuscleGql])
  muscles?: MuscleGql[];
  @Field(() => [EquipmentGql], { nullable: true })
  equipment?: EquipmentGql[] | null;
  @Field(() => [TagGql], { nullable: true })
  tags?: TagGql[] | null;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateExerciseInput {
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field() series!: string;
  @Field() repetitions!: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) instructions?: string;
  @Field({ nullable: true }) charge?: string;
  @Field(() => Int, { nullable: true }) rest?: number;
  @Field({ nullable: true }) videoUrl?: string;
  @Field(() => ExerciseVisibility) visibility!: ExerciseVisibility;
  @Field(() => [ID]) categoryIds!: string[];
  @Field(() => [ID]) muscleIds!: string[];
  @Field(() => [ID], { nullable: true }) equipmentIds?: string[];
  @Field(() => [ID], { nullable: true }) tagIds?: string[];
}

@InputType()
export class UpdateExerciseInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field({ nullable: true }) series?: string;
  @Field({ nullable: true }) repetitions?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) instructions?: string;
  @Field({ nullable: true }) charge?: string;
  @Field(() => Int, { nullable: true }) rest?: number;
  @Field({ nullable: true }) videoUrl?: string;
  @Field(() => ExerciseVisibility, { nullable: true }) visibility?: ExerciseVisibility;

  // Relations (replace whole sets)
  @Field(() => [ID], { nullable: true }) categoryIds?: string[];
  @Field(() => [ID], { nullable: true }) muscleIds?: string[];
  @Field(() => [ID], { nullable: true }) equipmentIds?: string[];
  @Field(() => [ID], { nullable: true }) tagIds?: string[];
}

@InputType()
export class ListExercisesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ExerciseVisibility, { nullable: true }) visibility?: ExerciseVisibility;
  @Field(() => [ID], { nullable: true }) categoryIds?: string[];
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ExerciseListGql {
  @Field(() => [ExerciseGql]) items!: ExerciseGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

// src/graphql/muscle/muscle.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum MuscleVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(MuscleVisibility, { name: 'MuscleVisibility' });

@ObjectType()
export class MuscleGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field(() => MuscleVisibility) visibility!: MuscleVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}

@InputType()
export class CreateMuscleInput {
  @Field() slug!: string;
  @Field() locale!: string;
  @Field(() => MuscleVisibility) visibility!: MuscleVisibility;
}

@InputType()
export class UpdateMuscleInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
}

@InputType()
export class GetMuscleInput {
  @Field({ nullable: true }) id: string;
}

@InputType()
export class ListMusclesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => MuscleVisibility, { nullable: true }) visibility?: MuscleVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class MuscleListGql {
  @Field(() => [MuscleGql]) items!: MuscleGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

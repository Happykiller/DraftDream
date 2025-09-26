// src/graphql/equipment/equipment.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum EquipmentVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(EquipmentVisibility, { name: 'EquipmentVisibility' });

@ObjectType()
export class EquipmentGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field(() => EquipmentVisibility) visibility!: EquipmentVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
}

@InputType()
export class CreateEquipmentInput {
  @Field() slug!: string;
  @Field() locale!: string;
  @Field(() => EquipmentVisibility) visibility!: EquipmentVisibility;
}

@InputType()
export class UpdateEquipmentInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
}

@InputType()
export class ListEquipmentInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => EquipmentVisibility, { nullable: true }) visibility?: EquipmentVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class EquipmentListGql {
  @Field(() => [EquipmentGql]) items!: EquipmentGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

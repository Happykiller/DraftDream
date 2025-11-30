// src/graphql/equipment/equipment.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { registerVisibilityEnum, Visibility as EquipmentVisibility } from '@graphql/common/visibility.enum';
export { EquipmentVisibility };
import { UserGql } from '@graphql/user/user.gql.types';



registerVisibilityEnum('EquipmentVisibility');

@ObjectType()
export class EquipmentGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => EquipmentVisibility) visibility!: EquipmentVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateEquipmentInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => EquipmentVisibility) visibility!: EquipmentVisibility;
}

@InputType()
export class UpdateEquipmentInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => EquipmentVisibility, { nullable: true }) visibility?: EquipmentVisibility;
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

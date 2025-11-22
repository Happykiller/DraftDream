// src/graphql/prospect/activity-preference/prospect-activity-preference.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum ProspectActivityPreferenceVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(ProspectActivityPreferenceVisibility, { name: 'ProspectActivityPreferenceVisibility' });

@ObjectType()
export class ProspectActivityPreferenceGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectActivityPreferenceVisibility) visibility!: ProspectActivityPreferenceVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateProspectActivityPreferenceInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectActivityPreferenceVisibility) visibility!: ProspectActivityPreferenceVisibility;
}

@InputType()
export class UpdateProspectActivityPreferenceInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ProspectActivityPreferenceVisibility, { nullable: true }) visibility?: ProspectActivityPreferenceVisibility;
}

@InputType()
export class ListProspectActivityPreferencesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ProspectActivityPreferenceVisibility, { nullable: true }) visibility?: ProspectActivityPreferenceVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ProspectActivityPreferenceListGql {
  @Field(() => [ProspectActivityPreferenceGql]) items!: ProspectActivityPreferenceGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

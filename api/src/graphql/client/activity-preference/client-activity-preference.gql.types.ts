// src/graphql/client/activity-preference/client-activity-preference.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum ClientActivityPreferenceVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(ClientActivityPreferenceVisibility, { name: 'ClientActivityPreferenceVisibility' });

@ObjectType()
export class ClientActivityPreferenceGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientActivityPreferenceVisibility) visibility!: ClientActivityPreferenceVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateClientActivityPreferenceInput {
  @Field({ nullable: true }) slug?: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientActivityPreferenceVisibility) visibility!: ClientActivityPreferenceVisibility;
}

@InputType()
export class UpdateClientActivityPreferenceInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ClientActivityPreferenceVisibility, { nullable: true }) visibility?: ClientActivityPreferenceVisibility;
}

@InputType()
export class ListClientActivityPreferencesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ClientActivityPreferenceVisibility, { nullable: true }) visibility?: ClientActivityPreferenceVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ClientActivityPreferenceListGql {
  @Field(() => [ClientActivityPreferenceGql]) items!: ClientActivityPreferenceGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

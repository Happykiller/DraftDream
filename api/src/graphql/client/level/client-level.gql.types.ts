// src/graphql/client/level/client-level.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum ClientLevelVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(ClientLevelVisibility, { name: 'ClientLevelVisibility' });

@ObjectType()
export class ClientLevelGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientLevelVisibility) visibility!: ClientLevelVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateClientLevelInput {
  @Field({ nullable: true }) slug?: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientLevelVisibility) visibility!: ClientLevelVisibility;
}

@InputType()
export class UpdateClientLevelInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ClientLevelVisibility, { nullable: true }) visibility?: ClientLevelVisibility;
}

@InputType()
export class ListClientLevelsInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ClientLevelVisibility, { nullable: true }) visibility?: ClientLevelVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ClientLevelListGql {
  @Field(() => [ClientLevelGql]) items!: ClientLevelGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

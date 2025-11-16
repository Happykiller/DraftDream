// src/graphql/client/source/client-source.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum ClientSourceVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(ClientSourceVisibility, { name: 'ClientSourceVisibility' });

@ObjectType()
export class ClientSourceGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientSourceVisibility) visibility!: ClientSourceVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateClientSourceInput {
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientSourceVisibility) visibility!: ClientSourceVisibility;
}

@InputType()
export class UpdateClientSourceInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ClientSourceVisibility, { nullable: true }) visibility?: ClientSourceVisibility;
}

@InputType()
export class ListClientSourcesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ClientSourceVisibility, { nullable: true }) visibility?: ClientSourceVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ClientSourceListGql {
  @Field(() => [ClientSourceGql]) items!: ClientSourceGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

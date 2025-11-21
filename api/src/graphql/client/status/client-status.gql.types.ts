// src/graphql/client/status/client-status.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum ClientStatusVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(ClientStatusVisibility, { name: 'ClientStatusVisibility' });

@ObjectType()
export class ClientStatusGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientStatusVisibility) visibility!: ClientStatusVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateClientStatusInput {
  @Field({ nullable: true }) slug?: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientStatusVisibility) visibility!: ClientStatusVisibility;
}

@InputType()
export class UpdateClientStatusInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ClientStatusVisibility, { nullable: true }) visibility?: ClientStatusVisibility;
}

@InputType()
export class ListClientStatusesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ClientStatusVisibility, { nullable: true }) visibility?: ClientStatusVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ClientStatusListGql {
  @Field(() => [ClientStatusGql]) items!: ClientStatusGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

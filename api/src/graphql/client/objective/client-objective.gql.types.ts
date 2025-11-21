// src/graphql/client/objective/client-objective.gql.types.ts
import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

export enum ClientObjectiveVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
}
registerEnumType(ClientObjectiveVisibility, { name: 'ClientObjectiveVisibility' });

@ObjectType()
export class ClientObjectiveGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientObjectiveVisibility) visibility!: ClientObjectiveVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateClientObjectiveInput {
  @Field({ nullable: true }) slug?: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ClientObjectiveVisibility) visibility!: ClientObjectiveVisibility;
}

@InputType()
export class UpdateClientObjectiveInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) slug?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ClientObjectiveVisibility, { nullable: true }) visibility?: ClientObjectiveVisibility;
}

@InputType()
export class ListClientObjectivesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ClientObjectiveVisibility, { nullable: true }) visibility?: ClientObjectiveVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ClientObjectiveListGql {
  @Field(() => [ClientObjectiveGql]) items!: ClientObjectiveGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

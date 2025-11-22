// src/graphql/prospect/source/prospect-source.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { registerVisibilityEnum, Visibility as ProspectSourceVisibility } from '@graphql/common/visibility.enum';
export { ProspectSourceVisibility };
import { UserGql } from '@graphql/user/user.gql.types';



registerVisibilityEnum('ProspectSourceVisibility');

@ObjectType()
export class ProspectSourceGql {
  @Field(() => ID) id!: string;
  @Field() slug!: string;
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectSourceVisibility) visibility!: ProspectSourceVisibility;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;
  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
}

@InputType()
export class CreateProspectSourceInput {
  @Field() locale!: string;
  @Field() label!: string;
  @Field(() => ProspectSourceVisibility) visibility!: ProspectSourceVisibility;
}

@InputType()
export class UpdateProspectSourceInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) label?: string;
  @Field(() => ProspectSourceVisibility, { nullable: true }) visibility?: ProspectSourceVisibility;
}

@InputType()
export class ListProspectSourcesInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) locale?: string;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => ProspectSourceVisibility, { nullable: true }) visibility?: ProspectSourceVisibility;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class ProspectSourceListGql {
  @Field(() => [ProspectSourceGql]) items!: ProspectSourceGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

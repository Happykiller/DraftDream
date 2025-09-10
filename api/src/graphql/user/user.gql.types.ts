// src/nestjs/user/user.gql.types.ts
import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';

@ObjectType()
export class AddressGql {
  @Field() name!: string;
  @Field() city!: string;
  @Field() code!: string;
  @Field() country!: string;
}

@ObjectType()
export class CompanyGql {
  @Field() name!: string;
  @Field(() => AddressGql, { nullable: true }) address?: AddressGql;
}

@ObjectType()
export class UserGql {
  @Field(() => ID) id!: string;
  @Field() type!: 'athlete' | 'coach' | 'admin';
  @Field() first_name!: string;
  @Field() last_name!: string;
  @Field() email!: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => AddressGql, { nullable: true }) address?: AddressGql;
  @Field(() => CompanyGql, { nullable: true }) company?: CompanyGql;
  @Field({ nullable: true }) createdAt?: Date;
  @Field({ nullable: true }) updatedAt?: Date;
}

// --------- Inputs ----------
@InputType()
export class AddressInput {
  @Field() name!: string;
  @Field() city!: string;
  @Field() code!: string;
  @Field() country!: string;
}

@InputType()
export class CompanyInput {
  @Field() name!: string;
  @Field(() => AddressInput, { nullable: true }) address?: AddressInput;
}

@InputType()
export class CreateUserInput {
  @Field() type!: 'athlete' | 'coach' | 'admin';
  @Field() first_name!: string;
  @Field() last_name!: string;
  @Field() email!: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => AddressInput, { nullable: true }) address?: AddressInput;
  @Field() password!: string;               // reçu en clair (hashé par le usecase)
  @Field({ nullable: true }) confirm_password?: string;
  @Field(() => CompanyInput, { nullable: true }) company?: CompanyInput;
}

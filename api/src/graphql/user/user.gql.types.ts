// src/nestjs/user/user.gql.types.ts
import { ObjectType, Field, ID, InputType, Int } from '@nestjs/graphql';

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
  @Field({ name: 'firstName' })
  get firstName(): string {
    return this.first_name;
  }

  @Field() last_name!: string;
  @Field({ name: 'lastName' })
  get lastName(): string {
    return this.last_name;
  }

  @Field() email!: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => AddressGql, { nullable: true }) address?: AddressGql;
  @Field(() => CompanyGql, { nullable: true }) company?: CompanyGql;
  @Field({ nullable: true }) createdAt?: Date;
  @Field({ nullable: true }) updatedAt?: Date;
  @Field() is_active!: boolean;
  @Field() createdBy!: string;
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
  @Field() password!: string;
  @Field({ nullable: true }) confirm_password?: string;
  @Field(() => CompanyInput, { nullable: true }) company?: CompanyInput;
  @Field({ nullable: true }) is_active?: boolean;
}

@InputType()
export class UpdateUserInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) type?: 'athlete' | 'coach' | 'admin';
  @Field({ nullable: true }) first_name?: string;
  @Field({ nullable: true }) last_name?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => AddressInput, { nullable: true }) address?: AddressInput;
  @Field(() => CompanyInput, { nullable: true }) company?: CompanyInput;
  @Field({ nullable: true }) is_active?: boolean; // NEW
}

@InputType()
export class UpdateMeInput {
  @Field({ nullable: true }) first_name?: string;
  @Field({ nullable: true }) last_name?: string;
  @Field({ nullable: true }) email?: string;
  @Field({ nullable: true }) phone?: string;
  @Field(() => AddressInput, { nullable: true }) address?: AddressInput;
  @Field(() => CompanyInput, { nullable: true }) company?: CompanyInput;
}

@ObjectType()
export class UserPageGql {
  @Field(() => [UserGql]) items!: UserGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

@InputType()
export class ListUsersInput {
  @Field({ nullable: true }) q?: string;
  @Field({ nullable: true }) type?: 'athlete' | 'coach' | 'admin';
  @Field({ nullable: true }) companyName?: string;
  @Field({ nullable: true }) is_active?: boolean;
  @Field({ nullable: true }) createdBy?: string;
  @Field({ nullable: true }) page?: number;
  @Field({ nullable: true }) limit?: number;
}
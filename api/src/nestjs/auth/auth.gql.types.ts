// src/nestjs/user/user.gql.types.ts
import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType()
export class SessionGql {
  @Field() access_token!: string;
}

// --------- Inputs ----------
@InputType()
export class AuthInput {
  @Field() email!: string;
  @Field() password!: string;
}

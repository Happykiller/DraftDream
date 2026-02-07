// src/graphql/note/note.gql.types.ts
import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { UserGql } from '@graphql/user/user.gql.types';

@ObjectType()
export class NoteGql {
  @Field(() => ID) id!: string;
  @Field() label!: string;
  @Field() description!: string;
  @Field(() => ID, { nullable: true }) athleteId?: string | null;
  @Field() createdBy!: string;
  @Field() createdAt!: Date;
  @Field() updatedAt!: Date;

  @Field(() => UserGql, { nullable: true })
  creator?: UserGql | null;
  @Field(() => UserGql, { nullable: true })
  athlete?: UserGql | null;
}

@InputType()
export class CreateNoteInput {
  @Field() label!: string;
  @Field() description!: string;
  @Field(() => ID, { nullable: true }) athleteId?: string | null;
}

@InputType()
export class UpdateNoteInput {
  @Field(() => ID) id!: string;
  @Field({ nullable: true }) label?: string;
  @Field({ nullable: true }) description?: string;
  @Field(() => ID, { nullable: true }) athleteId?: string | null;
}

@InputType()
export class ListNotesInput {
  @Field(() => ID, { nullable: true }) athleteId?: string | null;
  @Field({ nullable: true }) createdBy?: string;
  @Field(() => Int, { nullable: true }) limit?: number;
  @Field(() => Int, { nullable: true }) page?: number;
}

@ObjectType()
export class NoteListGql {
  @Field(() => [NoteGql]) items!: NoteGql[];
  @Field(() => Int) total!: number;
  @Field(() => Int) page!: number;
  @Field(() => Int) limit!: number;
}

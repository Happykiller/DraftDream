// src/graphql/note/note.module.ts
import { Module } from '@nestjs/common';

import { NoteResolver } from '@graphql/note/note.resolver';

@Module({
  providers: [
    NoteResolver,
  ],
})
export class NoteModule {}

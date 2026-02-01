// src/graphql/note/note.resolver.ts
import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  CreateNoteInput,
  ListNotesInput,
  NoteGql,
  NoteListGql,
  UpdateNoteInput,
} from '@graphql/note/note.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapNoteUsecaseToGql } from '@graphql/note/note.mapper';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';

@Resolver(() => NoteGql)
export class NoteResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() note: NoteGql): Promise<UserGql | null> {
    const userId = note.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => UserGql, { name: 'athlete', nullable: true })
  async athlete(@Parent() note: NoteGql): Promise<UserGql | null> {
    if (!note.athleteId) return null;

    const user = await inversify.getUserUsecase.execute({ id: note.athleteId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => NoteGql, { name: 'note_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async note_create(
    @Args('input') input: CreateNoteInput,
    @Context('req') req: any,
  ): Promise<NoteGql | null> {
    const created = await inversify.createNoteUsecase.execute({
      label: input.label,
      description: input.description,
      athleteId: input.athleteId,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return created ? mapNoteUsecaseToGql(created) : null;
  }

  @Query(() => NoteGql, { name: 'note_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async note_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<NoteGql | null> {
    const found = await inversify.getNoteUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return found ? mapNoteUsecaseToGql(found) : null;
  }

  @Query(() => NoteListGql, { name: 'note_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async note_list(
    @Args('input', { nullable: true }) input: ListNotesInput,
    @Context('req') req: any,
  ): Promise<NoteListGql> {
    const res = await inversify.listNotesUsecase.execute({
      athleteId: input?.athleteId,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return {
      items: res.items.map(mapNoteUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => NoteGql, { name: 'note_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async note_update(
    @Args('input') input: UpdateNoteInput,
    @Context('req') req: any,
  ): Promise<NoteGql | null> {
    const updated = await inversify.updateNoteUsecase.execute({
      id: input.id,
      label: input.label,
      description: input.description,
      athleteId: input.athleteId,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return updated ? mapNoteUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'note_delete' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async note_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return inversify.deleteNoteUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
  }

  @Mutation(() => Boolean, { name: 'note_hardDelete' })
  @Auth(Role.ADMIN)
  async note_hardDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return inversify.hardDeleteNoteUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
  }
}

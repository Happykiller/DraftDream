// src\\graphql\\program\\program.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '@graphql/common/ROLE';
import { Auth } from '@graphql/decorators/auth.decorator';
import { mapSessionUsecaseToGql } from '@graphql/session/session.mapper';
import { SessionSportGql } from '@graphql/session/session.gql.types';
import {
  ProgramGql,
  CreateProgramInput,
  UpdateProgramInput,
  ListProgramsInput,
  ProgramListGql,
} from '@graphql/program/program.gql.types';
import { mapProgramUsecaseToGql } from '@graphql/program/program.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import inversify from '@src/inversify/investify';
import type { SessionUsecaseModel } from '@usecases/session/session.usecase.model';

@Resolver(() => ProgramGql)
export class ProgramResolver {
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() program: ProgramGql): Promise<UserGql | null> {
    const userId = program.createdBy;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => [SessionSportGql], { name: 'sessions' })
  async sessions(@Parent() program: ProgramGql): Promise<SessionSportGql[]> {
    const ids = program.sessionIds ?? [];
    if (!ids.length) return [];
    const sessions = await Promise.all(
      ids.map(id => inversify.getSessionUsecase.execute({ id }))
    );
    return sessions
      .filter((s): s is SessionUsecaseModel => Boolean(s))
      .map(mapSessionUsecaseToGql);
  }

  @Mutation(() => ProgramGql, { name: 'program_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async program_create(
    @Args('input') input: CreateProgramInput,
    @Context('req') req: any,
  ): Promise<ProgramGql | null> {
    const created = await inversify.createProgramUsecase.execute({
      name: input.name,
      duration: input.duration,
      frequency: input.frequency,
      description: input.description,
      sessionIds: input.sessionIds,
      createdBy: req?.user?.id,
    });
    return created ? mapProgramUsecaseToGql(created) : null;
  }

  @Mutation(() => ProgramGql, { name: 'program_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async program_update(@Args('input') input: UpdateProgramInput): Promise<ProgramGql | null> {
    const updated = await inversify.updateProgramUsecase.execute(input.id, {
      name: input.name,
      duration: input.duration,
      frequency: input.frequency,
      description: input.description,
      sessionIds: input.sessionIds,
    });
    return updated ? mapProgramUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'program_softDelete' })
  @Auth(Role.ADMIN, Role.COACH)
  async program_softDelete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteProgramUsecase.execute({ id });
  }

  @Mutation(() => Boolean, { name: 'program_delete' })
  @Auth(Role.ADMIN)
  async program_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteProgramUsecase.execute({ id });
  }

  @Query(() => ProgramGql, { name: 'program_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async program_get(@Args('id', { type: () => ID }) id: string): Promise<ProgramGql | null> {
    const found = await inversify.getProgramUsecase.execute({ id });
    return found ? mapProgramUsecaseToGql(found) : null;
  }

  @Query(() => ProgramListGql, { name: 'program_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async program_list(@Args('input', { nullable: true }) input?: ListProgramsInput): Promise<ProgramListGql> {
    const res = await inversify.listProgramsUsecase.execute({
      q: input?.q,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapProgramUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }
}

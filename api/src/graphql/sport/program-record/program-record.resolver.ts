// src/graphql/sport/program-record/program-record.resolver.ts
import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';

import {
  CreateProgramRecordInput,
  ListProgramRecordsInput,
  ProgramRecordGql,
  ProgramRecordListGql,
  UpdateProgramRecordInput,
} from './program-record.gql.types';
import { mapProgramRecordUsecaseToGql } from './program-record.mapper';
import type { UsecaseSession } from '@src/usecases/sport/program-record/program-record.usecase.dto';

@Resolver(() => ProgramRecordGql)
export class ProgramRecordResolver {
  @Mutation(() => ProgramRecordGql, { name: 'programRecord_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async programRecord_create(
    @Args('input') input: CreateProgramRecordInput,
    @Context('req') req: any,
  ): Promise<ProgramRecordGql | null> {
    const session = this.extractSession(req);
    const created = await inversify.createProgramRecordUsecase.execute({
      userId: input.userId,
      programId: input.programId,
      sessionId: input.sessionId,
      state: input.state ?? undefined,
      session,
    });

    return created ? mapProgramRecordUsecaseToGql(created) : null;
  }

  @Mutation(() => ProgramRecordGql, { name: 'programRecord_updateState', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async programRecord_updateState(
    @Args('input') input: UpdateProgramRecordInput,
    @Context('req') req: any,
  ): Promise<ProgramRecordGql | null> {
    const session = this.extractSession(req);
    const updated = await inversify.updateProgramRecordUsecase.execute({
      id: input.id,
      state: input.state,
      session,
    });
    return updated ? mapProgramRecordUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'programRecord_delete' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async programRecord_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteProgramRecordUsecase.execute({ id, session });
  }

  @Mutation(() => Boolean, { name: 'programRecord_hardDelete' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async programRecord_hardDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.hardDeleteProgramRecordUsecase.execute({ id, session });
  }

  @Query(() => ProgramRecordGql, { name: 'programRecord_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async programRecord_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<ProgramRecordGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getProgramRecordUsecase.execute({ id, session });
    return found ? mapProgramRecordUsecaseToGql(found) : null;
  }

  @Query(() => ProgramRecordListGql, { name: 'programRecord_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async programRecord_list(
    @Args('input', { type: () => ListProgramRecordsInput, nullable: true }) input: ListProgramRecordsInput | null,
    @Context('req') req: any,
  ): Promise<ProgramRecordListGql> {
    const session = this.extractSession(req);
    const result = await inversify.listProgramRecordsUsecase.execute({
      userId: input?.userId,
      programId: input?.programId,
      sessionId: input?.sessionId,
      state: input?.state,
      includeArchived: input?.includeArchived,
      limit: input?.limit,
      page: input?.page,
      session,
    });

    return {
      items: result.items.map(mapProgramRecordUsecaseToGql),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  private extractSession(req: any): UsecaseSession {
    const user = req?.user;
    if (!user?.id || !user?.role) {
      throw new UnauthorizedException('Missing authenticated user in request context.');
    }

    return {
      userId: String(user.id),
      role: user.role as UsecaseSession['role'],
    };
  }
}

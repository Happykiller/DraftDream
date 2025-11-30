// src\graphql\session\session.resolver.ts
import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  CreateSessionInput,
  ListSessionsInput,
  SessionSportGql,
  SessionListGql,
  UpdateSessionInput,
  SessionExerciseSummaryGql,
  SessionVisibility,
} from '@src/graphql/sport/session/session.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { mapSessionUsecaseToGql } from '@src/graphql/sport/session/session.mapper';
import type { UsecaseSession } from '@src/usecases/sport/program/program.usecase.dto';

@Resolver(() => SessionSportGql)
export class SessionResolver {
  // ------- Field resolvers -------
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() session: SessionSportGql): Promise<UserGql | null> {
    const userId = session.createdBy;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => [SessionExerciseSummaryGql], { name: 'exercises' })
  async exercises(
    @Parent() session: SessionSportGql,
    @Context('req') req: any,
  ): Promise<SessionExerciseSummaryGql[]> {
    const sessionContext = this.extractSession(req);
    const exerciseIds = session.exerciseIds ?? [];
    if (exerciseIds.length === 0) {
      return [];
    }

    const uniqueIds = Array.from(new Set(exerciseIds));
    const fetched = await Promise.all(
      uniqueIds.map(async (exerciseId) => {
        const exercise = await inversify.getExerciseUsecase.execute({
          id: exerciseId,
          session: sessionContext,
        });
        return exercise ? { id: exercise.id, label: exercise.label } : null;
      }),
    );

    const summaries = new Map<string, SessionExerciseSummaryGql>();
    for (const item of fetched) {
      if (item) {
        summaries.set(item.id, item);
      }
    }

    return exerciseIds
      .map((id) => summaries.get(id))
      .filter((value): value is SessionExerciseSummaryGql => Boolean(value));
  }

  // ------- Mutations -------
  @Mutation(() => SessionSportGql, { name: 'session_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async session_create(
    @Args('input') input: CreateSessionInput,
    @Context('req') req: any,
  ): Promise<SessionSportGql | null> {
    const session = this.extractSession(req);
    const created = await inversify.createSessionUsecase.execute({
      locale: input.locale,
      label: input.label,
      durationMin: input.durationMin,
      description: input.description,
      exerciseIds: input.exerciseIds,
      visibility: this.normalizeSessionVisibility(input.visibility) ?? 'public',
      createdBy: session.userId,
    });
    return created ? mapSessionUsecaseToGql(created) : null; // null => slug/locale déjà pris
  }

  @Mutation(() => SessionSportGql, { name: 'session_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async session_update(@Args('input') input: UpdateSessionInput): Promise<SessionSportGql | null> {
    const updated = await inversify.updateSessionUsecase.execute(input.id, {
      locale: input.locale,
      label: input.label,
      durationMin: input.durationMin,
      description: input.description,
      exerciseIds: input.exerciseIds,
      visibility: this.normalizeSessionVisibility(input.visibility),
    });
    return updated ? mapSessionUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'session_softDelete' })
  @Auth(Role.ADMIN, Role.COACH)
  async session_softDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteSessionUsecase.execute({ id, session });
  }

  @Mutation(() => Boolean, { name: 'session_delete' })
  @Auth(Role.ADMIN)
  async session_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteSessionUsecase.execute({ id, session });
  }

  // ------- Queries -------
  @Query(() => SessionSportGql, { name: 'session_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async session_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<SessionSportGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getSessionUsecase.execute({ id, session });
    return found ? mapSessionUsecaseToGql(found) : null;
  }

  @Query(() => SessionListGql, { name: 'session_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async session_list(
    @Args('input', { type: () => ListSessionsInput, nullable: true }) input: ListSessionsInput | null,
    @Context('req') req: any,
  ): Promise<SessionListGql> {
    const session = this.extractSession(req);
    const res = await inversify.listSessionsUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
      session,
    });
    return {
      items: res.items.map(mapSessionUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
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

  private normalizeSessionVisibility(
    visibility?: SessionVisibility | null,
  ): 'private' | 'public' | 'hybrid' | undefined {
    if (!visibility) {
      return undefined;
    }
    return visibility === SessionVisibility.PUBLIC
      ? 'public'
      : visibility === SessionVisibility.HYBRID
        ? 'hybrid'
        : 'private';
  }
}

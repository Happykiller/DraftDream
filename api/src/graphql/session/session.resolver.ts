// src\graphql\session\session.resolver.ts
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
} from '@graphql/session/session.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { mapSessionUsecaseToGql } from '@graphql/session/session.mapper';

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

  // ------- Mutations -------
  @Mutation(() => SessionSportGql, { name: 'session_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async session_create(
    @Args('input') input: CreateSessionInput,
    @Context('req') req: any,
  ): Promise<SessionSportGql | null> {
    const created = await inversify.createSessionUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      durationMin: input.durationMin,
      description: input.description,
      exerciseIds: input.exerciseIds,
      createdBy: req?.user?.id,
    });
    return created ? mapSessionUsecaseToGql(created) : null; // null => slug/locale déjà pris
  }

  @Mutation(() => SessionSportGql, { name: 'session_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async session_update(@Args('input') input: UpdateSessionInput): Promise<SessionSportGql | null> {
    const updated = await inversify.updateSessionUsecase.execute(input.id, {
      slug: input.slug,
      locale: input.locale,
      label: input.label,
      durationMin: input.durationMin,
      description: input.description,
      exerciseIds: input.exerciseIds,
    });
    return updated ? mapSessionUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'session_softDelete' })
  @Auth(Role.ADMIN, Role.COACH)
  async session_softDelete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteSessionUsecase.execute({ id });
  }

  @Mutation(() => Boolean, { name: 'session_delete' })
  @Auth(Role.ADMIN)
  async session_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteSessionUsecase.execute({ id });
  }

  // ------- Queries -------
  @Query(() => SessionSportGql, { name: 'session_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async session_get(@Args('id', { type: () => ID }) id: string): Promise<SessionSportGql | null> {
    const found = await inversify.getSessionUsecase.execute({ id });
    return found ? mapSessionUsecaseToGql(found) : null;
  }

  @Query(() => SessionListGql, { name: 'session_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async session_list(@Args('input', { nullable: true }) input?: ListSessionsInput): Promise<SessionListGql> {
    const res = await inversify.listSessionsUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapSessionUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }
}

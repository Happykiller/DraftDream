// src/graphql/muscle/muscle.resolver.ts
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';

import {
  CreateMuscleInput,
  GetMuscleInput,
  ListMusclesInput,
  MuscleGql,
  MuscleListGql,
  UpdateMuscleInput,
} from '@graphql/muscle/muscle.gql.types';
import { mapMuscleUsecaseToGql } from '@graphql/muscle/muscle.mapper';

@Resolver(() => MuscleGql)
export class MuscleResolver {
  @Mutation(() => MuscleGql, { name: 'muscle_create', nullable: true })
  @Auth(Role.ADMIN)
  async muscle_create(
    @Args('input') input: CreateMuscleInput,
    @Context('req') req: any,
  ): Promise<MuscleGql | null> {
    const created = await inversify.createMuscleUsecase.execute({
      slug: input.slug,
      locale: input.locale,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapMuscleUsecaseToGql(created) : null;
  }

  @Query(() => MuscleGql, { name: 'muscle_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async muscle_get(@Args('input') input: GetMuscleInput): Promise<MuscleGql | null> {
    const found = await inversify.getMuscleUsecase.execute({
      id: input.id,
    });
    return found ? mapMuscleUsecaseToGql(found) : null;
  }

  @Query(() => MuscleListGql, { name: 'muscle_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async muscle_list(
    @Args('input', { nullable: true }) input?: ListMusclesInput,
  ): Promise<MuscleListGql> {
    const res = await inversify.listMusclesUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: input?.visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapMuscleUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => MuscleGql, { name: 'muscle_update', nullable: true })
  @Auth(Role.ADMIN)
  async muscle_update(@Args('input') input: UpdateMuscleInput): Promise<MuscleGql | null> {
    const updated = await inversify.updateMuscleUsecase.execute({
      id: input.id,
      slug: input.slug,
      locale: input.locale,
    });
    return updated ? mapMuscleUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'muscle_delete' })
  @Auth(Role.ADMIN)
  async muscle_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteMuscleUsecase.execute({ id });
  }
}

// src/graphql/equipment/equipment.resolver.ts
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '@graphql/common/ROLE';
import inversify from '@src/inversify/investify';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  CreateEquipmentInput,
  EquipmentGql,
  EquipmentListGql,
  ListEquipmentInput,
  UpdateEquipmentInput,
} from '@src/graphql/sport/equipment/equipment.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import { mapEquipmentUsecaseToGql } from '@src/graphql/sport/equipment/equipment.mapper';

@Resolver(() => EquipmentGql)
export class EquipmentResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() equipment: EquipmentGql): Promise<UserGql | null> {
    const userId = equipment.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => EquipmentGql, { name: 'equipment_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async equipment_create(
    @Args('input') input: CreateEquipmentInput,
    @Context('req') req: any,
  ): Promise<EquipmentGql | null> {
    const created = await inversify.createEquipmentUsecase.execute({
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
      createdBy: req?.user?.id,
    });
    return created ? mapEquipmentUsecaseToGql(created) : null;
  }

  @Query(() => EquipmentGql, { name: 'equipment_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async equipment_get(@Args('id', { type: () => ID }) id: string): Promise<EquipmentGql | null> {
    const found = await inversify.getEquipmentUsecase.execute({ id });
    return found ? mapEquipmentUsecaseToGql(found) : null;
  }

  @Query(() => EquipmentListGql, { name: 'equipment_list' })
  @Auth(Role.ADMIN, Role.COACH)
  async equipment_list(
    @Args('input', { nullable: true }) input?: ListEquipmentInput,
  ): Promise<EquipmentListGql> {
    const res = await inversify.listEquipmentUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: input?.visibility,
      limit: input?.limit,
      page: input?.page,
    });
    return {
      items: res.items.map(mapEquipmentUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => EquipmentGql, { name: 'equipment_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async equipment_update(
    @Args('input') input: UpdateEquipmentInput,
  ): Promise<EquipmentGql | null> {
    const updated = await inversify.updateEquipmentUsecase.execute({
      id: input.id,
      locale: input.locale,
      label: input.label,
      visibility: input.visibility,
    });
    return updated ? mapEquipmentUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'equipment_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async equipment_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteEquipmentUsecase.execute({ id });
  }
  @Mutation(() => Boolean, { name: 'equipment_hardDelete' })
  @Auth(Role.ADMIN)
  async equipment_hardDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return await inversify.hardDeleteEquipmentUsecase.execute({
      id,
      session: { userId: req.user.id, role: req.user.role },
    });
  }
}

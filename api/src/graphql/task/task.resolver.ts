// src/graphql/task/task.resolver.ts
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
  CreateTaskInput,
  ListTasksInput,
  TaskGql,
  TaskListGql,
  UpdateTaskInput,
} from '@graphql/task/task.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapTaskUsecaseToGql } from '@graphql/task/task.mapper';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';

@Resolver(() => TaskGql)
export class TaskResolver {

  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() task: TaskGql): Promise<UserGql | null> {
    const userId = task.createdBy;
    if (!userId) return null;

    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => TaskGql, { name: 'task_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async task_create(
    @Args('input') input: CreateTaskInput,
    @Context('req') req: any,
  ): Promise<TaskGql | null> {
    const created = await inversify.createTaskUsecase.execute({
      label: input.label,
      priority: input.priority,
      status: input.status,
      day: input.day,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return created ? mapTaskUsecaseToGql(created) : null;
  }

  @Query(() => TaskGql, { name: 'task_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async task_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<TaskGql | null> {
    const found = await inversify.getTaskUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return found ? mapTaskUsecaseToGql(found) : null;
  }

  @Query(() => TaskListGql, { name: 'task_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async task_list(
    @Args('input', { nullable: true }) input: ListTasksInput,
    @Context('req') req: any,
  ): Promise<TaskListGql> {
    const res = await inversify.listTasksUsecase.execute({
      priority: input?.priority,
      status: input?.status,
      day: input?.day,
      dayFrom: input?.dayFrom,
      dayTo: input?.dayTo,
      createdBy: input?.createdBy,
      limit: input?.limit,
      page: input?.page,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return {
      items: res.items.map(mapTaskUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  @Mutation(() => TaskGql, { name: 'task_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async task_update(
    @Args('input') input: UpdateTaskInput,
    @Context('req') req: any,
  ): Promise<TaskGql | null> {
    const updated = await inversify.updateTaskUsecase.execute({
      id: input.id,
      label: input.label,
      priority: input.priority,
      status: input.status,
      day: input.day,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return updated ? mapTaskUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'task_delete' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async task_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return inversify.deleteTaskUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
  }

  @Mutation(() => Boolean, { name: 'task_hardDelete' })
  @Auth(Role.ADMIN)
  async task_hardDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return inversify.hardDeleteTaskUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
  }
}

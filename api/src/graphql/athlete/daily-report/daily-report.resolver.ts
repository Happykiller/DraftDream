import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Auth } from '@graphql/decorators/auth.decorator';
import { Role } from '@graphql/common/ROLE';
import { TagGql } from '@graphql/tag/tag.gql.types';
import { mapTagUsecaseToGql } from '@graphql/tag/tag.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import inversify from '@src/inversify/investify';
import {
  CreateDailyReportInput,
  DailyReportGql,
  DailyReportListGql,
  ListDailyReportsInput,
  UpdateDailyReportInput,
} from './daily-report.gql.types';
import { mapDailyReportUsecaseToGql } from './daily-report.mapper';

@Resolver(() => DailyReportGql)
export class DailyReportResolver {
  @ResolveField(() => UserGql, { nullable: true })
  async athlete(@Parent() report: DailyReportGql): Promise<UserGql | null> {
    const user = await inversify.getUserUsecase.execute({ id: report.athleteId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => UserGql, { nullable: true })
  async creator(@Parent() report: DailyReportGql): Promise<UserGql | null> {
    const user = await inversify.getUserUsecase.execute({ id: report.createdBy });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => DailyReportGql, { name: 'dailyReport_create', nullable: true })
  @Auth(Role.ADMIN, Role.ATHLETE)
  async dailyReport_create(
    @Args('input') input: CreateDailyReportInput,
    @Context('req') req: any,
  ): Promise<DailyReportGql | null> {
    const created = await inversify.createDailyReportUsecase.execute({
      ...input,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return created ? mapDailyReportUsecaseToGql(created) : null;
  }

  @Query(() => DailyReportGql, { name: 'dailyReport_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async dailyReport_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<DailyReportGql | null> {
    const found = await inversify.getDailyReportUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return found ? mapDailyReportUsecaseToGql(found) : null;
  }

  @Query(() => DailyReportListGql, { name: 'dailyReport_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async dailyReport_list(
    @Args('input', { nullable: true }) input: ListDailyReportsInput,
    @Context('req') req: any,
  ): Promise<DailyReportListGql> {
    const result = await inversify.listDailyReportsUsecase.execute({
      athleteId: input?.athleteId,
      createdBy: input?.createdBy,
      reportDate: input?.reportDate,
      limit: input?.limit,
      page: input?.page,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });

    return {
      items: result.items.map(mapDailyReportUsecaseToGql),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Mutation(() => DailyReportGql, { name: 'dailyReport_update', nullable: true })
  @Auth(Role.ADMIN, Role.ATHLETE)
  async dailyReport_update(
    @Args('input') input: UpdateDailyReportInput,
    @Context('req') req: any,
  ): Promise<DailyReportGql | null> {
    const updated = await inversify.updateDailyReportUsecase.execute({
      ...input,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
    return updated ? mapDailyReportUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'dailyReport_delete' })
  @Auth(Role.ADMIN, Role.ATHLETE)
  async dailyReport_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return inversify.deleteDailyReportUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
  }

  @Mutation(() => Boolean, { name: 'dailyReport_hardDelete' })
  @Auth(Role.ADMIN)
  async dailyReport_hardDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    return inversify.hardDeleteDailyReportUsecase.execute({
      id,
      session: { userId: req?.user?.id, role: req?.user?.role },
    });
  }
}

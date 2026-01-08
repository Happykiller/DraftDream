// src/usecases/nutri/meal-record/list.meal-records.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import type { MealPlan } from '@services/db/models/meal-plan.model';
import { mapMealRecordToUsecase } from '@src/usecases/nutri/meal-record/meal-record.mapper';

import { ListMealRecordsUsecaseDto, UsecaseSession } from './meal-record.usecase.dto';
import { MealPlanSnapshotUsecaseModel, MealRecordUsecaseModel } from './meal-record.usecase.model';

interface ListMealRecordsResult {
  items: MealRecordUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Lists meal records with session-based filtering.
 */
export class ListMealRecordsUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Applies ownership constraints and returns paginated results.
   */
  async execute(dto: ListMealRecordsUsecaseDto): Promise<ListMealRecordsResult> {
    try {
      const { session, ...filters } = dto;
      const isAdmin = session.role === Role.ADMIN;
      const isCoach = session.role === Role.COACH;

      const result = await this.inversify.bddService.mealRecord.list({
        userId: isAdmin ? filters.userId : (isCoach ? filters.userId ?? session.userId : session.userId),
        mealPlanId: filters.mealPlanId,
        mealDayId: filters.mealDayId,
        mealId: filters.mealId,
        state: filters.state,
        includeArchived: isAdmin ? filters.includeArchived : false,
        limit: filters.limit,
        page: filters.page,
      });

      const mappedRecords = result.items.map(mapMealRecordToUsecase);
      const mealPlanSnapshots = await this.loadMealPlanSnapshots(mappedRecords, session);

      return {
        items: mappedRecords.map((record) => ({
          ...record,
          mealPlanSnapshot: mealPlanSnapshots[record.mealPlanId],
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListMealRecordsUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_MEAL_RECORDS_USECASE);
    }
  }

  private async loadMealPlanSnapshots(
    records: MealRecordUsecaseModel[],
    session: UsecaseSession,
  ): Promise<Record<string, MealPlanSnapshotUsecaseModel>> {
    const uniqueIds = Array.from(new Set(records.map((record) => record.mealPlanId)));
    const recordUserByMealPlanId = records.reduce<Record<string, string>>((accumulator, record) => {
      if (!accumulator[record.mealPlanId]) {
        accumulator[record.mealPlanId] = record.userId;
      }
      return accumulator;
    }, {});
    const snapshots = await Promise.all(
      uniqueIds.map(async (mealPlanId) => {
        const mealPlan = await this.inversify.bddService.mealPlan.get({ id: mealPlanId });
        const recordUserId = recordUserByMealPlanId[mealPlanId];
        if (!mealPlan || !recordUserId || !this.canAccessMealPlanSnapshot(session, mealPlan, recordUserId)) {
          return null;
        }
        return { id: mealPlan.id, label: mealPlan.label };
      }),
    );

    return uniqueIds.reduce<Record<string, MealPlanSnapshotUsecaseModel>>((accumulator, mealPlanId, index) => {
      const snapshot = snapshots[index];
      if (snapshot) {
        accumulator[mealPlanId] = snapshot;
      }
      return accumulator;
    }, {});
  }

  private canAccessMealPlanSnapshot(session: UsecaseSession, mealPlan: MealPlan, recordUserId: string): boolean {
    if (session.role === Role.ADMIN) {
      return true;
    }

    if (session.userId === mealPlan.createdBy) {
      return true;
    }

    if (session.role === Role.COACH) {
      return Boolean(mealPlan.userId && mealPlan.userId === recordUserId);
    }

    return Boolean(mealPlan.userId && mealPlan.userId === session.userId);
  }
}

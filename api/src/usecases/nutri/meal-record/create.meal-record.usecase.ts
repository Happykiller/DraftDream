// src/usecases/nutri/meal-record/create.meal-record.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { MealRecordState } from '@src/common/meal-record-state.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';
import type { MealRecordMealSnapshotUsecaseModel } from '@src/usecases/nutri/meal-record/meal-record.usecase.model';
import { mapMealRecordToUsecase } from '@src/usecases/nutri/meal-record/meal-record.mapper';

import {
  CreateMealRecordUsecaseDto,
  UsecaseSession,
} from './meal-record.usecase.dto';
import { MealRecordUsecaseModel } from './meal-record.usecase.model';

/**
 * Starts a meal record for an athlete meal plan meal.
 */
export class CreateMealRecordUsecase {
  constructor(private readonly inversify: Inversify) { }

  /**
   * Creates a meal record after validating ownership and meal plan scope.
   */
  async execute(dto: CreateMealRecordUsecaseDto): Promise<MealRecordUsecaseModel | null> {
    try {
      const userId = dto.userId ?? dto.session.userId;
      this.assertCreationRights(dto.session, userId);

      const mealPlan = await this.ensureMealPlanAccessible(dto.session, dto.mealPlanId, userId);
      if (!mealPlan) {
        return null;
      }

      const mealSnapshot = this.getMealSnapshot(mealPlan, dto.mealDayId, dto.mealId);
      if (!mealSnapshot) {
        return null;
      }

      const created = await this.inversify.bddService.mealRecord.create({
        userId,
        mealPlanId: dto.mealPlanId,
        mealDayId: dto.mealDayId,
        mealId: dto.mealId,
        mealSnapshot,
        comment: dto.comment,
        satisfactionRating: dto.satisfactionRating,
        state: dto.state ?? MealRecordState.CREATE,
        createdBy: dto.session.userId,
      });

      return created ? mapMealRecordToUsecase(created) : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateMealRecordUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CREATE_MEAL_RECORD_USECASE);
    }
  }

  private assertCreationRights(session: UsecaseSession, targetUserId: string): void {
    const isAdmin = session.role === Role.ADMIN;
    const isSelf = session.userId === targetUserId;
    if (!isAdmin && session.role === Role.ATHLETE && !isSelf) {
      throw new Error(ERRORS.FORBIDDEN);
    }
  }

  private async ensureMealPlanAccessible(
    session: UsecaseSession,
    mealPlanId: string,
    targetUserId: string,
  ): Promise<MealPlanUsecaseModel | null> {
    const mealPlan = await this.inversify.getMealPlanUsecase.execute({ id: mealPlanId, session });
    if (!mealPlan) {
      return null;
    }

    if (session.role === Role.ADMIN) {
      return mealPlan;
    }

    if (mealPlan.userId && mealPlan.userId !== targetUserId) {
      throw new Error(ERRORS.FORBIDDEN);
    }

    return mealPlan;
  }

  private getMealSnapshot(
    mealPlan: MealPlanUsecaseModel,
    mealDayId: string,
    mealId: string,
  ): MealRecordMealSnapshotUsecaseModel | null {
    const day = mealPlan.days.find(
      (candidate) => candidate.id === mealDayId || candidate.templateMealDayId === mealDayId,
    );
    if (!day) {
      return null;
    }

    const meal = day.meals.find(
      (candidate) => candidate.id === mealId || candidate.templateMealId === mealId,
    );
    if (!meal) {
      return null;
    }

    return {
      ...meal,
      type: { ...meal.type },
    };
  }
}

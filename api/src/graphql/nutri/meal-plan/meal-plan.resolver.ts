// src/graphql/meal-plan/meal-plan.resolver.ts
import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';

import { Role } from '@graphql/common/ROLE';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  MealPlanGql,
  MealPlanListGql,
  CreateMealPlanInput,
  UpdateMealPlanInput,
  ListMealPlansInput,
  MealPlanDayInput,
  MealPlanMealInput,
  MealPlanMealTypeInput,
  MealPlanVisibility,
} from '@src/graphql/nutri/meal-plan/meal-plan.gql.types';
import { mapMealPlanUsecaseToGql } from '@src/graphql/nutri/meal-plan/meal-plan.mapper';
import { MealTypeVisibility } from '@src/graphql/nutri/meal-type/meal-type.gql.types';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import inversify from '@src/inversify/investify';
import { buildSlug, slugifyCandidate } from '@src/common/slug.util';
import type { UsecaseSession } from '@usecases/program/program.usecase.dto';
import type {
  MealPlanDaySnapshotUsecaseDto,
  MealPlanMealSnapshotUsecaseDto,
  MealPlanMealTypeSnapshotUsecaseDto,
} from '@usecases/meal-plan/meal-plan.usecase.dto';
import type { MealPlanUsecaseModel } from '@usecases/meal-plan/meal-plan.usecase.model';

@Resolver(() => MealPlanGql)
export class MealPlanResolver {
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() mealPlan: MealPlanGql): Promise<UserGql | null> {
    const userId = mealPlan.createdBy;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => UserGql, { name: 'athlete', nullable: true })
  async athlete(@Parent() mealPlan: MealPlanGql): Promise<UserGql | null> {
    const userId = mealPlan.userId ?? undefined;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => MealPlanGql, { name: 'mealPlan_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async mealPlan_create(
    @Args('input') input: CreateMealPlanInput,
    @Context('req') req: any,
  ): Promise<MealPlanGql | null> {
    const session = this.extractSession(req);
    const slug = buildSlug({ slug: input.slug, label: input.label, fallback: 'meal-plan' });
    const days = await this.resolveDays(session, input.days, input.dayIds, {
      defaultLocale: input.locale,
    });

    const payload = {
      slug,
      locale: input.locale,
      label: input.label,
      description: input.description,
      visibility: this.normalizeMealPlanVisibility(input.visibility) ?? 'private',
      calories: input.calories,
      proteinGrams: input.proteinGrams,
      carbGrams: input.carbGrams,
      fatGrams: input.fatGrams,
      days,
      userId: input.userId === undefined ? undefined : input.userId,
      createdBy: session.userId,
    };

    const created = await inversify.createMealPlanUsecase.execute(payload);
    return created ? mapMealPlanUsecaseToGql(created) : null;
  }

  @Mutation(() => MealPlanGql, { name: 'mealPlan_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async mealPlan_update(
    @Args('input') input: UpdateMealPlanInput,
    @Context('req') req: any,
  ): Promise<MealPlanGql | null> {
    const session = this.extractSession(req);
    const updateDto: any = {
      locale: input.locale,
      label: input.label,
      description: input.description ?? undefined,
      visibility: this.normalizeMealPlanVisibility(input.visibility),
      calories: input.calories,
      proteinGrams: input.proteinGrams,
      carbGrams: input.carbGrams,
      fatGrams: input.fatGrams,
      userId: input.userId === undefined ? undefined : input.userId,
    };

    let cachedMealPlan: MealPlanUsecaseModel | null | undefined;
    const getCurrentMealPlan = async (): Promise<MealPlanUsecaseModel | null> => {
      if (cachedMealPlan === undefined) {
        cachedMealPlan = await inversify.getMealPlanUsecase.execute({
          id: input.id,
          session,
        });
      }
      return cachedMealPlan ?? null;
    };

    if (input.slug !== undefined) {
      const normalized = slugifyCandidate(input.slug);
      if (normalized) {
        updateDto.slug = normalized;
      } else {
        let fallbackLabel = input.label;
        if (!fallbackLabel?.trim()) {
          const current = await getCurrentMealPlan();
          fallbackLabel = current?.label;
        }
        updateDto.slug = buildSlug({ label: fallbackLabel, fallback: 'meal-plan' });
      }
    }

    const resolveOptions = {
      defaultLocale:
        this.normalizeLocaleValue(input.locale) ??
        this.normalizeLocaleValue((await getCurrentMealPlan())?.locale),
    };

    if (input.days !== undefined) {
      updateDto.days = await this.resolveDays(session, input.days, undefined, resolveOptions);
    } else if (input.dayIds !== undefined) {
      updateDto.days = await this.resolveDays(session, undefined, input.dayIds, resolveOptions);
    }

    const updated = await inversify.updateMealPlanUsecase.execute(input.id, updateDto);
    return updated ? mapMealPlanUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'mealPlan_softDelete' })
  @Auth(Role.ADMIN, Role.COACH)
  async mealPlan_softDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteMealPlanUsecase.execute({ id, session });
  }

  @Mutation(() => Boolean, { name: 'mealPlan_delete' })
  @Auth(Role.ADMIN)
  async mealPlan_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteMealPlanUsecase.execute({ id, session });
  }

  @Query(() => MealPlanGql, { name: 'mealPlan_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealPlan_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<MealPlanGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getMealPlanUsecase.execute({ id, session });
    return found ? mapMealPlanUsecaseToGql(found) : null;
  }

  @Query(() => MealPlanListGql, { name: 'mealPlan_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async mealPlan_list(
    @Args('input', { type: () => ListMealPlansInput, nullable: true }) input: ListMealPlansInput | null,
    @Context('req') req: any,
  ): Promise<MealPlanListGql> {
    const session = this.extractSession(req);
    const res = await inversify.listMealPlansUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: this.normalizeMealPlanVisibility(input?.visibility),
      userId: input?.userId,
      limit: input?.limit,
      page: input?.page,
      session,
    });
    return {
      items: res.items.map(mapMealPlanUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  private generateId(): string {
    return new ObjectId().toHexString();
  }

  private async resolveDays(
    userSession: UsecaseSession,
    daysInput?: MealPlanDayInput[] | null,
    dayIds?: string[] | null,
    options: { defaultLocale?: string | null } = {},
  ): Promise<MealPlanDaySnapshotUsecaseDto[]> {
    const defaultLocale = this.normalizeLocaleValue(options.defaultLocale);

    if (daysInput?.length) {
      return daysInput.map((day) => ({
        id: day.id ?? this.generateId(),
        templateMealDayId: day.templateMealDayId,
        slug: buildSlug({ slug: day.slug, label: day.label, fallback: 'meal-day' }),
        locale: this.normalizeLocaleValue(day.locale) ?? defaultLocale,
        label: day.label.trim(),
        description: day.description ?? undefined,
        meals: (day.meals ?? []).map((meal) => this.mapMealInputToSnapshot(meal, defaultLocale)),
      }));
    }

    if (!dayIds?.length) {
      return [];
    }

    const mealDays = await Promise.all(
      dayIds.map((id) =>
        inversify.getMealDayUsecase.execute({
          id,
          session: userSession,
        }),
      ),
    );

    const resolved: MealPlanDaySnapshotUsecaseDto[] = [];

    for (const mealDay of mealDays) {
      if (!mealDay) continue;

      const meals = await Promise.all(
        (mealDay.mealIds ?? []).map((mealId) => inversify.getMealUsecase.execute({ id: mealId })),
      );

      const mealSnapshots: MealPlanMealSnapshotUsecaseDto[] = [];
      for (const meal of meals) {
        if (!meal) continue;

        let typeSnapshot: MealPlanMealTypeSnapshotUsecaseDto | null = null;
        if (meal.typeId) {
          const mealType = await inversify.getMealTypeUsecase.execute({ id: meal.typeId });
          typeSnapshot = {
            id: mealType?.id ?? meal.typeId,
            templateMealTypeId: mealType?.id ?? meal.typeId,
            slug: mealType?.slug,
            locale: mealType?.locale,
            label: mealType?.label ?? 'Meal type',
            visibility: mealType?.visibility,
          };
        }

        mealSnapshots.push({
          id: this.generateId(),
          templateMealId: meal.id,
          slug: buildSlug({ slug: meal.slug, label: meal.label, fallback: 'meal' }),
          locale: this.normalizeLocaleValue(meal.locale) ?? defaultLocale,
          label: meal.label,
          description: undefined,
          foods: meal.foods,
          calories: meal.calories,
          proteinGrams: meal.proteinGrams,
          carbGrams: meal.carbGrams,
          fatGrams: meal.fatGrams,
          type:
            typeSnapshot ?? {
              id: meal.typeId,
              templateMealTypeId: meal.typeId,
              label: 'Meal type',
            },
        });
      }

      resolved.push({
        id: this.generateId(),
        templateMealDayId: mealDay.id,
        slug: buildSlug({ slug: mealDay.slug, label: mealDay.label, fallback: 'meal-day' }),
        locale: this.normalizeLocaleValue(mealDay.locale) ?? defaultLocale,
        label: mealDay.label,
        description: mealDay.description ?? undefined,
        meals: mealSnapshots,
      });
    }

    return resolved;
  }

  private mapMealInputToSnapshot(
    meal: MealPlanMealInput,
    defaultLocale?: string,
  ): MealPlanMealSnapshotUsecaseDto {
    return {
      id: meal.id ?? this.generateId(),
      templateMealId: meal.templateMealId,
      slug: meal.slug ? buildSlug({ slug: meal.slug, label: meal.label, fallback: 'meal' }) : undefined,
      locale: this.normalizeLocaleValue(meal.locale) ?? defaultLocale,
      label: meal.label.trim(),
      description: meal.description ?? undefined,
      foods: meal.foods,
      calories: meal.calories,
      proteinGrams: meal.proteinGrams,
      carbGrams: meal.carbGrams,
      fatGrams: meal.fatGrams,
      type: this.mapMealTypeInput(meal.type, { fallbackLabel: meal.label }),
    };
  }

  private mapMealTypeInput(
    type: MealPlanMealTypeInput,
    options: { fallbackLabel: string },
  ): MealPlanMealTypeSnapshotUsecaseDto {
    const trimmedLabel = type?.label?.trim();
    const label =
      trimmedLabel && trimmedLabel.length > 0
        ? trimmedLabel
        : options.fallbackLabel.trim();
    return {
      id: type?.id,
      templateMealTypeId: type?.templateMealTypeId ?? type?.id,
      slug: type?.slug ?? undefined,
      locale: this.normalizeLocaleValue(type?.locale),
      label,
      visibility: this.normalizeMealTypeVisibility(type?.visibility),
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

  private normalizeLocaleValue(locale?: string | null): string | undefined {
    const normalized = locale?.trim().toLowerCase();
    if (!normalized) {
      return undefined;
    }
    return normalized;
  }

  /**
   * Aligns the GraphQL enum with the domain visibility literals.
   */
  private normalizeMealPlanVisibility(
    visibility?: MealPlanVisibility | null,
  ): 'private' | 'public' | undefined {
    if (!visibility) {
      return undefined;
    }
    return visibility === MealPlanVisibility.PUBLIC ? 'public' : 'private';
  }

  /**
   * Converts the nested meal type visibility enum to the persisted literal union.
   */
  private normalizeMealTypeVisibility(
    visibility?: MealTypeVisibility | null,
  ): 'private' | 'public' | undefined {
    if (!visibility) {
      return undefined;
    }
    return visibility === MealTypeVisibility.PUBLIC ? 'public' : 'private';
  }
}

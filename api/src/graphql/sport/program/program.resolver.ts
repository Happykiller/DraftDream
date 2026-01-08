// src\\graphql\\program\\program.resolver.ts
import { UnauthorizedException } from '@nestjs/common';
import { Args, Context, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ObjectId } from 'mongodb';

import { Role } from '@graphql/common/ROLE';
import { Auth } from '@graphql/decorators/auth.decorator';
import {
  ProgramGql,
  CreateProgramInput,
  UpdateProgramInput,
  ListProgramsInput,
  ProgramListGql,
  ProgramSessionInput,
  ProgramVisibility,
} from '@src/graphql/sport/program/program.gql.types';
import { mapProgramUsecaseToGql } from '@src/graphql/sport/program/program.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import inversify from '@src/inversify/investify';
import type {
  ProgramSessionSnapshotUsecaseDto,
  UsecaseSession,
} from '@src/usecases/sport/program/program.usecase.dto';

@Resolver(() => ProgramGql)
export class ProgramResolver {
  @ResolveField(() => UserGql, { name: 'creator', nullable: true })
  async creator(@Parent() program: ProgramGql): Promise<UserGql | null> {
    const userId = program.createdBy;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @ResolveField(() => UserGql, { name: 'athlete', nullable: true })
  async athlete(@Parent() program: ProgramGql): Promise<UserGql | null> {
    const userId = program.userId;
    if (!userId) return null;
    const user = await inversify.getUserUsecase.execute({ id: userId });
    return user ? mapUserUsecaseToGql(user) : null;
  }

  @Mutation(() => ProgramGql, { name: 'program_create', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async program_create(
    @Args('input') input: CreateProgramInput,
    @Context('req') req: any,
  ): Promise<ProgramGql | null> {
    const session = this.extractSession(req);
    const sessions = await this.resolveSessions(session, input.sessions, input.sessionIds, {
      defaultLocale: input.locale,
    });
    const payload = {
      session,
      locale: input.locale,
      label: input.label,
      visibility: this.normalizeProgramVisibility(input.visibility) ?? 'PRIVATE',
      duration: input.duration,
      frequency: input.frequency,
      description: input.description,
      startDate: input.startDate ?? undefined,
      endDate: input.endDate ?? undefined,
      sessions,
      userId: input.userId === undefined ? undefined : input.userId,
      createdBy: session.userId,
    };

    const created = await inversify.createProgramUsecase.execute(payload);
    return created ? mapProgramUsecaseToGql(created) : null;
  }

  @Mutation(() => ProgramGql, { name: 'program_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async program_update(
    @Args('input') input: UpdateProgramInput,
    @Context('req') req: any,
  ): Promise<ProgramGql | null> {
    const session = this.extractSession(req);
    const sessions = await this.resolveSessions(session, input.sessions, input.sessionIds, {
      defaultLocale: input.locale,
    });
    const updateDto: any = {
      session,
      locale: input.locale,
      label: input.label,
      visibility: this.normalizeProgramVisibility(input.visibility),
      duration: input.duration,
      frequency: input.frequency,
      description: input.description ?? undefined,
      startDate: input.startDate === undefined ? undefined : input.startDate ?? null,
      endDate: input.endDate === undefined ? undefined : input.endDate ?? null,
      sessions,
      userId: input.userId === undefined ? undefined : input.userId,
    };

    const updated = await inversify.updateProgramUsecase.execute(input.id, updateDto);
    return updated ? mapProgramUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'program_softDelete' })
  @Auth(Role.ADMIN, Role.COACH)
  async program_softDelete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteProgramUsecase.execute({ id, session });
  }

  @Mutation(() => Boolean, { name: 'program_delete' })
  @Auth(Role.ADMIN)
  async program_delete(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<boolean> {
    const session = this.extractSession(req);
    return inversify.deleteProgramUsecase.execute({ id, session });
  }

  @Query(() => ProgramGql, { name: 'program_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async program_get(
    @Args('id', { type: () => ID }) id: string,
    @Context('req') req: any,
  ): Promise<ProgramGql | null> {
    const session = this.extractSession(req);
    const found = await inversify.getProgramUsecase.execute({ id, session });
    return found ? mapProgramUsecaseToGql(found) : null;
  }

  @Query(() => ProgramListGql, { name: 'program_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async program_list(
    @Args('input', { type: () => ListProgramsInput, nullable: true }) input: ListProgramsInput | null,
    @Context('req') req: any,
  ): Promise<ProgramListGql> {
    const session = this.extractSession(req);
    const res = await inversify.listProgramsUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      visibility: this.normalizeProgramVisibility(input?.visibility),
      userId: input?.userId,
      limit: input?.limit,
      page: input?.page,
      session,
    });
    return {
      items: res.items.map(mapProgramUsecaseToGql),
      total: res.total,
      page: res.page,
      limit: res.limit,
    };
  }

  private generateId(): string {
    return new ObjectId().toHexString();
  }

  private async resolveSessions(
    userSession: UsecaseSession,
    sessionsInput?: ProgramSessionInput[] | null,
    sessionIds?: string[] | null,
    options: { defaultLocale?: string | null } = {},
  ): Promise<ProgramSessionSnapshotUsecaseDto[]> {
    const defaultLocale = this.normalizeLocaleValue(options.defaultLocale);

    if (sessionsInput?.length) {
      return sessionsInput.map((session) => ({
        id: session.id ?? this.generateId(),
        templateSessionId: session.templateSessionId,
        locale: this.normalizeLocaleValue(session.locale) ?? defaultLocale,
        label: session.label.trim(),
        durationMin: session.durationMin,
        description: session.description ?? undefined,
        exercises: (session.exercises ?? []).map((exercise) => ({
          id: exercise.id ?? this.generateId(),
          templateExerciseId: exercise.templateExerciseId,
          label: exercise.label.trim(),
          description: exercise.description ?? undefined,
          instructions: exercise.instructions ?? undefined,
          series: exercise.series ?? undefined,
          repetitions: exercise.repetitions ?? undefined,
          charge: exercise.charge ?? undefined,
          restSeconds: exercise.restSeconds ?? undefined,
          videoUrl: exercise.videoUrl ?? undefined,
          categoryIds: this.normalizeIdArray(exercise.categoryIds),
          muscleIds: this.normalizeIdArray(exercise.muscleIds),
          equipmentIds: this.normalizeIdArray(exercise.equipmentIds),
          tagIds: this.normalizeIdArray(exercise.tagIds),
        })),
      }));
    }

    if (!sessionIds?.length) return [];

    // Fetch sessions, filtering out any that don't exist or can't be accessed
    const sessionPromises = sessionIds.map(async (id) => {
      try {
        return await inversify.getSessionUsecase.execute({
          id,
          session: userSession,
        });
      } catch (error) {
        // Log warning but don't fail the entire operation
        inversify.loggerService.warn?.(
          `Failed to fetch session ${id}: ${error instanceof Error ? error.message : String(error)}`
        );
        return null;
      }
    });

    const sessions = await Promise.all(sessionPromises);

    const resolved: ProgramSessionSnapshotUsecaseDto[] = [];

    for (const sessionModel of sessions) {
      if (!sessionModel) continue;

      const exercises = await Promise.all(
        (sessionModel.exerciseIds ?? []).map((exerciseId) =>
          inversify.getExerciseUsecase.execute({
            id: exerciseId,
            session: userSession,
          }),
        ),
      );

      resolved.push({
        id: this.generateId(),
        templateSessionId: sessionModel.id,
        locale: this.normalizeLocaleValue(sessionModel.locale) ?? defaultLocale,
        label: sessionModel.label,
        durationMin: sessionModel.durationMin,
        description: sessionModel.description ?? undefined,
        exercises: exercises
          .filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise))
          .map((exercise) => ({
            id: this.generateId(),
            templateExerciseId: exercise.id,
            label: exercise.label,
            description: exercise.description ?? undefined,
            instructions: exercise.instructions ?? undefined,
            series: exercise.series ?? undefined,
            repetitions: exercise.repetitions ?? undefined,
            charge: exercise.charge ?? undefined,
            restSeconds: exercise.rest ?? undefined,
            videoUrl: exercise.videoUrl ?? undefined,
            categoryIds: this.normalizeIdArray(exercise.categoryIds),
            muscleIds: this.normalizeIdArray(exercise.muscleIds),
            equipmentIds: this.normalizeIdArray(exercise.equipmentIds),
            tagIds: this.normalizeIdArray(exercise.tagIds),
          })),
      });
    }

    return resolved;
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

  private normalizeIdArray(values?: string[] | null): string[] | undefined {
    if (!Array.isArray(values)) {
      return undefined;
    }
    const normalized = Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean)));
    return normalized.length ? normalized : undefined;
  }

  /**
   * Maps the GraphQL visibility enum to the persistence-friendly string literal union.
   */
  private normalizeProgramVisibility(
    visibility?: ProgramVisibility | null,
  ): 'PRIVATE' | 'PUBLIC' | undefined {
    if (!visibility) {
      return undefined;
    }
    return visibility === ProgramVisibility.PUBLIC ? 'PUBLIC' : 'PRIVATE';
  }
}

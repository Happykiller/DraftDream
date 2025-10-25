// src\\graphql\\program\\program.resolver.ts
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
} from '@graphql/program/program.gql.types';
import { mapProgramUsecaseToGql } from '@graphql/program/program.mapper';
import { UserGql } from '@graphql/user/user.gql.types';
import { mapUserUsecaseToGql } from '@graphql/user/user.mapper';
import inversify from '@src/inversify/investify';
import { buildSlug, slugifyCandidate } from '@src/common/slug.util';
import type { ProgramSessionSnapshotUsecaseDto } from '@usecases/program/program.usecase.dto';
import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

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
    const slug = buildSlug({ slug: input.slug, label: input.label, fallback: 'program' });
    const sessions = await this.resolveSessions(input.sessions, input.sessionIds, {
      defaultLocale: input.locale,
    });
    const payload = {
      slug,
      locale: input.locale,
      label: input.label,
      duration: input.duration,
      frequency: input.frequency,
      description: input.description,
      sessions,
      userId: input.userId ?? undefined,
      createdBy: req?.user?.id,
    };

    const created = await inversify.createProgramUsecase.execute(payload);
    return created ? mapProgramUsecaseToGql(created) : null;
  }

  @Mutation(() => ProgramGql, { name: 'program_update', nullable: true })
  @Auth(Role.ADMIN, Role.COACH)
  async program_update(@Args('input') input: UpdateProgramInput): Promise<ProgramGql | null> {
    const updateDto: any = {
      locale: input.locale,
      label: input.label,
      duration: input.duration,
      frequency: input.frequency,
      description: input.description ?? undefined,
      userId: input.userId ?? undefined,
    };

    let cachedProgram: ProgramUsecaseModel | null | undefined;
    const getCurrentProgram = async (): Promise<ProgramUsecaseModel | null> => {
      if (cachedProgram === undefined) {
        cachedProgram = await inversify.getProgramUsecase.execute({ id: input.id });
      }
      return cachedProgram ?? null;
    };

    if (input.slug !== undefined) {
      const normalized = slugifyCandidate(input.slug);
      if (normalized) {
        updateDto.slug = normalized;
      } else {
        let fallbackLabel = input.label;
        if (!fallbackLabel || !fallbackLabel.trim()) {
          const current = await getCurrentProgram();
          fallbackLabel = current?.label;
        }
        updateDto.slug = buildSlug({ label: fallbackLabel, fallback: 'program' });
      }
    }

    if (input.sessions !== undefined) {
      const defaultLocale =
        this.normalizeLocaleValue(input.locale) ??
        this.normalizeLocaleValue((await getCurrentProgram())?.locale);
      const sessions = await this.resolveSessions(input.sessions, undefined, {
        defaultLocale,
      });
      updateDto.sessions = sessions;
    } else if (input.sessionIds !== undefined) {
      const defaultLocale =
        this.normalizeLocaleValue(input.locale) ??
        this.normalizeLocaleValue((await getCurrentProgram())?.locale);
      const sessions = await this.resolveSessions(undefined, input.sessionIds, {
        defaultLocale,
      });
      updateDto.sessions = sessions;
    }

    const updated = await inversify.updateProgramUsecase.execute(input.id, updateDto);
    return updated ? mapProgramUsecaseToGql(updated) : null;
  }

  @Mutation(() => Boolean, { name: 'program_softDelete' })
  @Auth(Role.ADMIN)
  async program_softDelete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteProgramUsecase.execute({ id });
  }

  @Mutation(() => Boolean, { name: 'program_delete' })
  @Auth(Role.ADMIN, Role.COACH)
  async program_delete(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return inversify.deleteProgramUsecase.execute({ id });
  }

  @Query(() => ProgramGql, { name: 'program_get', nullable: true })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async program_get(@Args('id', { type: () => ID }) id: string): Promise<ProgramGql | null> {
    const found = await inversify.getProgramUsecase.execute({ id });
    return found ? mapProgramUsecaseToGql(found) : null;
  }

  @Query(() => ProgramListGql, { name: 'program_list' })
  @Auth(Role.ADMIN, Role.COACH, Role.ATHLETE)
  async program_list(@Args('input', { nullable: true }) input?: ListProgramsInput): Promise<ProgramListGql> {
    const res = await inversify.listProgramsUsecase.execute({
      q: input?.q,
      locale: input?.locale,
      createdBy: input?.createdBy,
      userId: input?.userId,
      limit: input?.limit,
      page: input?.page,
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
    sessionsInput?: ProgramSessionInput[] | null,
    sessionIds?: string[] | null,
    options: { defaultLocale?: string | null } = {},
  ): Promise<ProgramSessionSnapshotUsecaseDto[]> {
    const defaultLocale = this.normalizeLocaleValue(options.defaultLocale);

    if (sessionsInput && sessionsInput.length) {
      return sessionsInput.map((session) => ({
        id: session.id ?? this.generateId(),
        templateSessionId: session.templateSessionId,
        slug: buildSlug({ slug: session.slug, label: session.label, fallback: 'session' }),
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
          level: exercise.level ?? undefined,
        })),
      }));
    }

    if (!sessionIds || !sessionIds.length) return [];

    const sessions = await Promise.all(
      sessionIds.map((id) => inversify.getSessionUsecase.execute({ id })),
    );

    const resolved: ProgramSessionSnapshotUsecaseDto[] = [];

    for (const session of sessions) {
      if (!session) continue;

      const exercises = await Promise.all(
        (session.exerciseIds ?? []).map((exerciseId) =>
          inversify.getExerciseUsecase.execute({ id: exerciseId }),
        ),
      );

      resolved.push({
        id: this.generateId(),
        templateSessionId: session.id,
        slug: buildSlug({ slug: session.slug, label: session.label, fallback: 'session' }),
        locale: this.normalizeLocaleValue(session.locale) ?? defaultLocale,
        label: session.label,
        durationMin: session.durationMin,
        description: session.description ?? undefined,
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
            level: exercise.level ?? undefined,
          })),
      });
    }

    return resolved;
  }

  private normalizeLocaleValue(locale?: string | null): string | undefined {
    const normalized = locale?.trim().toLowerCase();
    return normalized || undefined;
  }
}

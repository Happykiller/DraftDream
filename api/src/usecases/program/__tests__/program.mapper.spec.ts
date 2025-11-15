import { describe, expect, it } from '@jest/globals';
import { mapProgramToUsecase } from '../program.mapper';

import type { Program } from '@services/db/models/program.model';
import type { User } from '@services/db/models/user.model';

describe('mapProgramToUsecase', () => {
  it('maps nested snapshots and unwraps the creator identifier', () => {
    const createdAt = new Date('2024-09-01T08:00:00.000Z');
    const updatedAt = new Date('2024-09-02T08:00:00.000Z');

    const program: Program = {
      id: 'program-1',
      slug: 'strength-block',
      locale: 'fr-FR',
      label: 'Bloc Force',
      visibility: 'public',
      duration: 6,
      frequency: 4,
      description: 'Strength cycle',
      sessions: [
        {
          id: 'session-1',
          templateSessionId: 'template-session-1',
          slug: 'day-1',
          locale: 'fr-FR',
          label: 'Jour 1',
          durationMin: 60,
          description: 'Lower body',
          exercises: [
            {
              id: 'exercise-1',
              templateExerciseId: 'template-ex-1',
              label: 'Back squat',
              description: 'Barbell squat',
              instructions: 'Chest up',
              series: '5',
              repetitions: '5',
              charge: '80%',
              restSeconds: 180,
              videoUrl: 'https://example.com/squat',
              level: 'advanced',
              categoryIds: ['cat-1'],
              muscleIds: ['muscle-1'],
              equipmentIds: ['equipment-1'],
              tagIds: ['tag-1'],
            },
          ],
        },
      ],
      userId: 'athlete-1',
      createdBy: {
        id: 'coach-123',
        type: 'coach',
        first_name: 'Nadia',
        last_name: 'Comaneci',
        email: 'nadia@example.com',
        is_active: true,
        createdBy: 'system',
      } satisfies User,
      deletedAt: undefined,
      createdAt,
      updatedAt,
    };

    const result = mapProgramToUsecase(program);

    expect(result).toEqual({
      id: 'program-1',
      slug: 'strength-block',
      locale: 'fr-FR',
      label: 'Bloc Force',
      visibility: 'public',
      duration: 6,
      frequency: 4,
      description: 'Strength cycle',
      sessions: [
        {
          id: 'session-1',
          templateSessionId: 'template-session-1',
          slug: 'day-1',
          locale: 'fr-FR',
          label: 'Jour 1',
          durationMin: 60,
          description: 'Lower body',
          exercises: [
            {
              id: 'exercise-1',
              templateExerciseId: 'template-ex-1',
              label: 'Back squat',
              description: 'Barbell squat',
              instructions: 'Chest up',
              series: '5',
              repetitions: '5',
              charge: '80%',
              restSeconds: 180,
              videoUrl: 'https://example.com/squat',
              level: 'advanced',
              categoryIds: ['cat-1'],
              muscleIds: ['muscle-1'],
              equipmentIds: ['equipment-1'],
              tagIds: ['tag-1'],
            },
          ],
        },
      ],
      userId: 'athlete-1',
      createdBy: 'coach-123',
      deletedAt: undefined,
      createdAt,
      updatedAt,
    });

    expect(result.sessions).not.toBe(program.sessions);
    expect(result.sessions[0].exercises).not.toBe(program.sessions[0].exercises);
  });

  it('keeps the creator identifier unchanged when already a string', () => {
    const program: Program = {
      id: 'program-2',
      slug: 'conditioning',
      locale: 'fr-FR',
      label: 'Conditionnement',
      visibility: 'private',
      duration: 4,
      frequency: 3,
      sessions: [],
      createdBy: 'coach-77',
      createdAt: new Date('2024-10-01T08:00:00.000Z'),
      updatedAt: new Date('2024-10-02T08:00:00.000Z'),
    };

    const result = mapProgramToUsecase(program);

    expect(result.createdBy).toBe('coach-77');
    expect(result.sessions).toEqual([]);
  });
});

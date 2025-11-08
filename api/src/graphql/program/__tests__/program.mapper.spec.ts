import { mapProgramUsecaseToGql } from '../program.mapper';

import type { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

describe('mapProgramUsecaseToGql', () => {
  it('maps nested sessions and exercises to GraphQL snapshots', () => {
    const createdAt = new Date('2023-04-01T00:00:00.000Z');
    const updatedAt = new Date('2023-04-02T00:00:00.000Z');

    const model: ProgramUsecaseModel = {
      id: 'program-1',
      slug: 'strength',
      locale: 'fr-FR',
      label: 'Programme Force',
      duration: 8,
      frequency: 3,
      description: 'Full body strength program',
      sessions: [
        {
          id: 'session-1',
          templateSessionId: 'template-session-1',
          slug: 'day-1',
          locale: 'fr-FR',
          label: 'Jour 1',
          durationMin: 60,
          description: 'Leg focus',
          exercises: [
            {
              id: 'exercise-1',
              templateExerciseId: 'template-ex-1',
              label: 'Squat',
              description: 'Back squat',
              instructions: 'Keep chest up',
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
      createdBy: 'coach-5',
      createdAt,
      updatedAt,
    };

    const result = mapProgramUsecaseToGql(model);

    expect(result).toEqual({
      id: 'program-1',
      slug: 'strength',
      locale: 'fr-FR',
      label: 'Programme Force',
      duration: 8,
      frequency: 3,
      description: 'Full body strength program',
      sessions: [
        {
          id: 'session-1',
          templateSessionId: 'template-session-1',
          slug: 'day-1',
          locale: 'fr-FR',
          label: 'Jour 1',
          durationMin: 60,
          description: 'Leg focus',
          exercises: [
            {
              id: 'exercise-1',
              templateExerciseId: 'template-ex-1',
              label: 'Squat',
              description: 'Back squat',
              instructions: 'Keep chest up',
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
      createdBy: 'coach-5',
      createdAt,
      updatedAt,
    });
    expect(result.sessions).not.toBe(model.sessions);
    expect(result.sessions[0].exercises).not.toBe(model.sessions[0].exercises);
  });
});

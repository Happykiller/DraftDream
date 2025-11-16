import { describe, expect, it } from '@jest/globals';
import { mapSessionUsecaseToGql } from '../session.mapper';

import type { SessionUsecaseModel } from '@src/usecases/sport/session/session.usecase.model';

describe('mapSessionUsecaseToGql', () => {
  it('copies identifiers and metadata', () => {
    const createdAt = new Date('2023-07-01T00:00:00.000Z');
    const updatedAt = new Date('2023-07-02T00:00:00.000Z');
    const exerciseIds = ['ex-1', 'ex-2'];

    const model: SessionUsecaseModel = {
      id: 'session-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      durationMin: 45,
      description: 'Warm up and cardio',
      exerciseIds,
      createdBy: 'coach-7',
      createdAt,
      updatedAt,
    };

    const result = mapSessionUsecaseToGql(model);

    expect(result).toEqual({
      id: 'session-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      durationMin: 45,
      description: 'Warm up and cardio',
      exerciseIds: ['ex-1', 'ex-2'],
      exercises: [],
      createdBy: 'coach-7',
      createdAt,
      updatedAt,
    });
    expect(result.exerciseIds).not.toBe(exerciseIds);
  });
});

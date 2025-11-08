import { describe, expect, it } from '@jest/globals';
import { mapMuscleUsecaseToGql } from '../muscle.mapper';

import { MuscleVisibility } from '@graphql/muscle/muscle.gql.types';
import type { MuscleUsecaseModel } from '@usecases/muscle/muscle.usecase.model';

describe('mapMuscleUsecaseToGql', () => {
  it('maps fields and casts visibility enum', () => {
    const createdAt = new Date('2023-12-01T00:00:00.000Z');
    const updatedAt = new Date('2023-12-02T00:00:00.000Z');

    const model: MuscleUsecaseModel = {
      id: 'muscle-1',
      slug: 'quadriceps',
      locale: 'fr-FR',
      label: 'Quadriceps',
      visibility: 'private',
      createdBy: 'coach-13',
      createdAt,
      updatedAt,
    };

    const result = mapMuscleUsecaseToGql(model);

    expect(result).toEqual({
      id: 'muscle-1',
      slug: 'quadriceps',
      locale: 'fr-FR',
      label: 'Quadriceps',
      visibility: MuscleVisibility.PRIVATE,
      createdBy: 'coach-13',
      createdAt,
      updatedAt,
    });
  });
});

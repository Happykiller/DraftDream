import { describe, expect, it } from '@jest/globals';
import { mapExerciseUsecaseToGql } from '../exercise.mapper';

import { ExerciseLevelGql, ExerciseVisibility } from '@graphql/exercise/exercise.gql.types';
import type { ExerciseUsecaseModel } from '@usecases/exercise/exercise.usecase.model';

describe('mapExerciseUsecaseToGql', () => {
  it('transforms identifiers arrays and enums for GraphQL', () => {
    const createdAt = new Date('2023-05-01T00:00:00.000Z');
    const updatedAt = new Date('2023-05-02T00:00:00.000Z');

    const model: ExerciseUsecaseModel = {
      id: 'exercise-1',
      slug: 'push-up',
      locale: 'fr-FR',
      label: 'Pompes',
      description: 'Upper body exercise',
      instructions: 'Keep your body aligned',
      level: 'intermediate',
      series: '4',
      repetitions: '12',
      charge: 'bodyweight',
      rest: 90,
      videoUrl: 'https://example.com/pushup',
      visibility: 'private',
      categoryIds: ['category-1'],
      muscleIds: ['muscle-1', 'muscle-2'],
      equipmentIds: ['equipment-1'],
      tagIds: ['tag-1'],
      createdBy: 'coach-6',
      createdAt,
      updatedAt,
    };

    const result = mapExerciseUsecaseToGql(model);

    expect(result).toEqual({
      id: 'exercise-1',
      slug: 'push-up',
      locale: 'fr-FR',
      label: 'Pompes',
      description: 'Upper body exercise',
      instructions: 'Keep your body aligned',
      level: ExerciseLevelGql.INTERMEDIATE,
      series: '4',
      repetitions: '12',
      charge: 'bodyweight',
      rest: 90,
      videoUrl: 'https://example.com/pushup',
      visibility: ExerciseVisibility.PRIVATE,
      categoryIds: ['category-1'],
      muscleIds: ['muscle-1', 'muscle-2'],
      equipmentIds: ['equipment-1'],
      tagIds: ['tag-1'],
      createdBy: 'coach-6',
      createdAt,
      updatedAt,
    });
    expect(result.categoryIds).not.toBe(model.categoryIds);
    expect(result.muscleIds).not.toBe(model.muscleIds);
    expect(result.equipmentIds).not.toBe(model.equipmentIds);
    expect(result.tagIds).not.toBe(model.tagIds);
  });

  it('omits optional arrays when undefined', () => {
    const model: ExerciseUsecaseModel = {
      id: 'exercise-2',
      slug: 'plank',
      locale: 'fr-FR',
      label: 'Gainage',
      level: 'beginner',
      series: '3',
      repetitions: '45s',
      visibility: 'public',
      categoryIds: [],
      muscleIds: [],
      createdBy: 'coach-9',
      createdAt: new Date('2023-06-01T00:00:00.000Z'),
      updatedAt: new Date('2023-06-02T00:00:00.000Z'),
    };

    const result = mapExerciseUsecaseToGql(model);

    expect(result.equipmentIds).toBeUndefined();
    expect(result.tagIds).toBeUndefined();
  });
});

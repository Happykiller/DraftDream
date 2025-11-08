import { mapExerciseToUsecase } from '../exercise.mapper';

import type { Exercise } from '@services/db/models/exercise.model';
import type { Category } from '@services/db/models/category.model';
import type { Equipment } from '@services/db/models/equipment.model';
import type { Muscle } from '@services/db/models/muscle.model';
import type { Tag } from '@services/db/models/tag.model';
import type { User } from '@services/db/models/user.model';

const buildCategory = (id: string): Category => ({
  id,
  slug: `${id}-slug`,
  locale: 'fr-FR',
  label: `${id}-label`,
  visibility: 'public',
  createdBy: 'admin-1',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-02T00:00:00.000Z'),
});

const buildMuscle = (id: string): Muscle => ({
  id,
  slug: `${id}-slug`,
  locale: 'fr-FR',
  label: `${id}-label`,
  visibility: 'private',
  createdBy: 'admin-2',
  createdAt: new Date('2024-02-01T00:00:00.000Z'),
  updatedAt: new Date('2024-02-02T00:00:00.000Z'),
});

const buildEquipment = (id: string): Equipment => ({
  id,
  slug: `${id}-slug`,
  locale: 'fr-FR',
  label: `${id}-label`,
  visibility: 'public',
  createdBy: 'admin-3',
  createdAt: new Date('2024-03-01T00:00:00.000Z'),
  updatedAt: new Date('2024-03-02T00:00:00.000Z'),
});

const buildTag = (id: string): Tag => ({
  id,
  slug: `${id}-slug`,
  locale: 'fr-FR',
  label: `${id}-label`,
  visibility: 'private',
  createdBy: 'admin-4',
  createdAt: new Date('2024-04-01T00:00:00.000Z'),
  updatedAt: new Date('2024-04-02T00:00:00.000Z'),
});

const buildUser = (id: string): User => ({
  id,
  type: 'coach',
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  is_active: true,
  createdBy: 'system',
});

describe('mapExerciseToUsecase', () => {
  it('maps the database exercise into the use case representation', () => {
    const createdAt = new Date('2024-05-01T00:00:00.000Z');
    const updatedAt = new Date('2024-05-02T00:00:00.000Z');

    const exercise: Exercise = {
      id: 'exercise-1',
      slug: 'push-up',
      locale: 'fr-FR',
      label: 'Pompes',
      description: 'Upper body exercise',
      instructions: 'Keep your back straight',
      level: 'beginner',
      series: '3',
      repetitions: '15',
      charge: 'bodyweight',
      rest: 60,
      videoUrl: 'https://example.com/video',
      visibility: 'public',
      categories: [buildCategory('category-1'), buildCategory('category-2')],
      muscles: [buildMuscle('muscle-1')],
      equipment: [buildEquipment('equipment-1')],
      tags: [buildTag('tag-1')],
      createdBy: buildUser('coach-1'),
      createdAt,
      updatedAt,
    };

    const result = mapExerciseToUsecase(exercise);

    expect(result).toEqual({
      id: 'exercise-1',
      slug: 'push-up',
      locale: 'fr-FR',
      label: 'Pompes',
      description: 'Upper body exercise',
      instructions: 'Keep your back straight',
      level: 'beginner',
      series: '3',
      repetitions: '15',
      charge: 'bodyweight',
      rest: 60,
      videoUrl: 'https://example.com/video',
      visibility: 'public',
      categoryIds: ['category-1', 'category-2'],
      muscleIds: ['muscle-1'],
      equipmentIds: ['equipment-1'],
      tagIds: ['tag-1'],
      createdBy: 'coach-1',
      createdAt,
      updatedAt,
    });
  });

  it('defaults optional relations to empty arrays when undefined', () => {
    const exercise: Exercise = {
      id: 'exercise-2',
      slug: 'plank',
      locale: 'fr-FR',
      label: 'Gainage',
      level: 'intermediate',
      series: '4',
      repetitions: '45s',
      visibility: 'private',
      categories: [],
      muscles: [],
      createdBy: 'coach-9',
      createdAt: new Date('2024-06-01T00:00:00.000Z'),
      updatedAt: new Date('2024-06-02T00:00:00.000Z'),
    };

    const result = mapExerciseToUsecase(exercise);

    expect(result.categoryIds).toEqual([]);
    expect(result.muscleIds).toEqual([]);
    expect(result.equipmentIds).toBeUndefined();
    expect(result.tagIds).toBeUndefined();
  });
});

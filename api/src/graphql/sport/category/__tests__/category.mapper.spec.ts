import { describe, expect, it } from '@jest/globals';
import { mapCategoryUsecaseToGql } from '../category.mapper';

import { CategoryVisibility } from '@graphql/sport/category/category.gql.types';
import type { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';

describe('mapCategoryUsecaseToGql', () => {
  it('casts visibility and copies metadata', () => {
    const createdAt = new Date('2023-09-01T00:00:00.000Z');
    const updatedAt = new Date('2023-09-02T00:00:00.000Z');

    const model: CategoryUsecaseModel = {
      id: 'category-1',
      slug: 'strength',
      locale: 'fr-FR',
      label: 'Force',
      visibility: 'PUBLIC',
      createdBy: 'coach-10',
      createdAt,
      updatedAt,
    };

    const result = mapCategoryUsecaseToGql(model);

    expect(result).toEqual({
      id: 'category-1',
      slug: 'strength',
      locale: 'fr-FR',
      label: 'Force',
      visibility: CategoryVisibility.PUBLIC,
      createdBy: 'coach-10',
      createdAt,
      updatedAt,
    });
  });
});

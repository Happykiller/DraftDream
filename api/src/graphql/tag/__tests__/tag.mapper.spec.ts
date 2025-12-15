import { describe, expect, it } from '@jest/globals';
import { mapTagUsecaseToGql } from '../tag.mapper';

import { TagVisibility } from '@graphql/tag/tag.gql.types';
import type { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';

describe('mapTagUsecaseToGql', () => {
  it('maps primitive fields directly', () => {
    const createdAt = new Date('2023-11-01T00:00:00.000Z');
    const updatedAt = new Date('2023-11-02T00:00:00.000Z');

    const model: TagUsecaseModel = {
      id: 'tag-1',
      slug: 'mobility',
      locale: 'fr-FR',
      label: 'Mobilité',
      visibility: 'PUBLIC',
      createdBy: 'coach-12',
      createdAt,
      updatedAt,
    };

    const result = mapTagUsecaseToGql(model);

    expect(result).toEqual({
      id: 'tag-1',
      slug: 'mobility',
      locale: 'fr-FR',
      label: 'Mobilité',
      visibility: TagVisibility.PUBLIC,
      createdBy: 'coach-12',
      createdAt,
      updatedAt,
    });
  });
});

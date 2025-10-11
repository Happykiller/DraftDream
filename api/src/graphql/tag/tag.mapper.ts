// src/graphql/tag/tag.mapper.ts
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { TagGql, TagVisibility } from '@graphql/tag/tag.gql.types';

export function mapTagUsecaseToGql(m: TagUsecaseModel): TagGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    name: m.name,
    visibility: m.visibility as TagVisibility,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

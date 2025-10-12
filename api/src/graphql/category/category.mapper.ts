// src/graphql/category/category.mapper.ts
import { CategoryUsecaseModel } from '@usecases/category/category.usecase.model';
import { CategoryGql, CategoryVisibility } from './category.gql.types';

export function mapCategoryUsecaseToGql(m: CategoryUsecaseModel): CategoryGql {
  return {
    id: m.id,
    slug: m.slug,
    locale: m.locale,
    label: m.label,
    visibility: m.visibility as CategoryVisibility,
    createdBy: m.createdBy,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
}

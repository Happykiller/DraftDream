// src/nestjs/user/user.mapper.ts
import { UserGql } from '@graphql/user/user.gql.types';
import { UserUsecaseModel } from '@src/usecases/user/user.usecase.model';

/**
 * Map a UserUsecaseModel (domain/usecase) to UserGql (GraphQL output type).
 * Pure function: no NestJS dependency.
 * 
 */
export function mapUserUsecaseToGql(model: UserUsecaseModel): UserGql {
  return {
    id: model.id,
    type: model.type,
    first_name: model.first_name,
    firstName: model.first_name,
    last_name: model.last_name,
    lastName: model.last_name,
    email: model.email,
    phone: model.phone,
    address: model.address
      ? {
          name: model.address.name,
          city: model.address.city,
          code: model.address.code,
          country: model.address.country,
        }
      : undefined,
    company: model.company
      ? {
          name: model.company.name,
          address: model.company.address
            ? {
                name: model.company.address.name,
                city: model.company.address.city,
                code: model.company.address.code,
                country: model.company.address.country,
              }
            : undefined,
        }
      : undefined,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    is_active: model.is_active,
    createdBy: model.createdBy,
  };
}

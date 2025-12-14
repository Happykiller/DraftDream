import { describe, expect, it } from '@jest/globals';
import { mapUserUsecaseToGql } from '../user.mapper';

import type { UserUsecaseModel } from '@usecases/user/user.usecase.model';

describe('mapUserUsecaseToGql', () => {
  it('maps nested address and company objects when provided', () => {
    const createdAt = new Date('2024-01-01T00:00:00.000Z');
    const updatedAt = new Date('2024-01-02T00:00:00.000Z');

    const model: UserUsecaseModel = {
      id: 'user-1',
      type: 'coach',
      first_name: 'Marie',
      last_name: 'Curie',
      email: 'marie@example.com',
      phone: '+33123456789',
      address: {
        name: 'Maison',
        city: 'Paris',
        code: '75000',
        country: 'France',
      },
      company: {
        name: 'ScienceFit',
        address: {
          name: 'Siège',
          city: 'Paris',
          code: '75001',
          country: 'France',
        },
      },
      is_active: true,
      createdAt,
      updatedAt,
      createdBy: 'admin-1',
    };

    const result = mapUserUsecaseToGql(model);

    expect(result).toEqual({
      id: 'user-1',
      type: 'coach',
      first_name: 'Marie',
      last_name: 'Curie',
      email: 'marie@example.com',
      phone: '+33123456789',
      address: {
        name: 'Maison',
        city: 'Paris',
        code: '75000',
        country: 'France',
      },
      company: {
        name: 'ScienceFit',
        address: {
          name: 'Siège',
          city: 'Paris',
          code: '75001',
          country: 'France',
        },
      },
      createdAt,
      updatedAt,
      is_active: true,
      createdBy: 'admin-1',
      firstName: 'Marie',
      lastName: 'Curie',
    });
  });

  it('omits optional nested structures when missing', () => {
    const model: UserUsecaseModel = {
      id: 'user-2',
      type: 'athlete',
      first_name: 'Alan',
      last_name: 'Turing',
      email: 'alan@example.com',
      is_active: false,
      createdBy: 'admin-1',
    };

    const result = mapUserUsecaseToGql(model);

    expect(result.address).toBeUndefined();
    expect(result.company).toBeUndefined();
    expect(result.createdAt).toBeUndefined();
    expect(result.updatedAt).toBeUndefined();
  });
});

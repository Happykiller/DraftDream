import { mapSessionToUsecase } from '../session.mapper';

import type { Session } from '@services/db/models/session.model';
import type { User } from '@services/db/models/user.model';

describe('mapSessionToUsecase', () => {
  it('converts a session with a user creator into a use case model', () => {
    const createdAt = new Date('2024-07-01T10:00:00.000Z');
    const updatedAt = new Date('2024-07-02T10:00:00.000Z');

    const session: Session = {
      id: 'session-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      durationMin: 45,
      description: 'Warm-up and cardio',
      exerciseIds: ['ex-1', 'ex-2'],
      createdBy: {
        id: 'coach-42',
        type: 'coach',
        first_name: 'Grace',
        last_name: 'Hopper',
        email: 'grace@example.com',
        is_active: true,
        createdBy: 'system',
      } satisfies User,
      deletedAt: undefined,
      createdAt,
      updatedAt,
    };

    const result = mapSessionToUsecase(session);

    expect(result).toEqual({
      id: 'session-1',
      slug: 'day-1',
      locale: 'fr-FR',
      label: 'Jour 1',
      durationMin: 45,
      description: 'Warm-up and cardio',
      exerciseIds: ['ex-1', 'ex-2'],
      createdBy: 'coach-42',
      deletedAt: undefined,
      createdAt,
      updatedAt,
    });
    expect(result.exerciseIds).not.toBe(session.exerciseIds);
  });

  it('preserves string creators and optional fields', () => {
    const session: Session = {
      id: 'session-2',
      slug: 'day-2',
      locale: 'fr-FR',
      label: 'Jour 2',
      durationMin: 30,
      exerciseIds: ['ex-3'],
      createdBy: 'coach-7',
      createdAt: new Date('2024-08-01T10:00:00.000Z'),
      updatedAt: new Date('2024-08-02T10:00:00.000Z'),
    };

    const result = mapSessionToUsecase(session);

    expect(result.createdBy).toBe('coach-7');
    expect(result.description).toBeUndefined();
    expect(result.deletedAt).toBeUndefined();
  });
});

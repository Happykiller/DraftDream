import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ObjectId } from 'mongodb';

const collectionMock = {
  find: jest.fn(),
  countDocuments: jest.fn(),
};

jest.mock('@src/inversify/investify', () => ({
  __esModule: true,
  default: {
    mongo: {
      collection: jest.fn(() => collectionMock),
    },
  },
}));

import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';

const createCursorMock = () => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  toArray: jest.fn().mockResolvedValue([]),
});

describe('BddServiceMealPlanMongo.list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should combine search and ownership/public visibility filters for coach listing', async () => {
    const repository = new BddServiceMealPlanMongo();
    const cursor = createCursorMock();
    collectionMock.find.mockReturnValue(cursor as any);
    collectionMock.countDocuments.mockResolvedValue(0);

    await repository.list({
      q: 'super',
      createdByIn: ['507f1f77bcf86cd799439011'],
      includePublicVisibility: true,
      page: 1,
      limit: 12,
    });

    const filter = collectionMock.find.mock.calls[0][0];

    expect(filter).toEqual({
      $and: [
        {
          $or: [
            { slug: { $regex: /super/i } },
            { label: { $regex: /super/i } },
            { description: { $regex: /super/i } },
          ],
        },
        {
          $or: [
            { createdBy: { $in: [new ObjectId('507f1f77bcf86cd799439011')] } },
            { visibility: 'PUBLIC' },
          ],
        },
        { deletedAt: { $exists: false } },
      ],
    });
  });
});

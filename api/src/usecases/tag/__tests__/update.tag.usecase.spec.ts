import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { UpdateTagUsecase } from '@usecases/tag/update.tag.usecase';
import { UpdateTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    // Simple slugify for testing purposes
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateTagUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let tagRepositoryMock: BddServiceTagMongo;
  let loggerMock: LoggerMock;
  let usecase: UpdateTagUsecase;

  const dto: UpdateTagUsecaseDto = {
    id: 'tag-789',
    locale: 'en-US',
    label: 'Flexibility',
    visibility: 'private',
  };

  const updatedTag: TagUsecaseModel = {
    id: 'tag-789',
    slug: 'flexibility',
    locale: 'en-US',
    label: 'Flexibility',
    visibility: 'private',
    createdBy: 'coach-3',
    createdAt: new Date('2024-03-01T00:00:00.000Z'),
    updatedAt: new Date('2024-04-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    tagRepositoryMock = {
      update: createMockFn(),
    } as unknown as BddServiceTagMongo;

    bddServiceMock = {
      tag: tagRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new UpdateTagUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the tag through the repository', async () => {
    asMock(tagRepositoryMock.update).mockResolvedValue(updatedTag);

    const result = await usecase.execute(dto);

    expect(asMock(tagRepositoryMock.update).mock.calls[0]).toEqual([
      dto.id,
      {
        slug: 'flexibility',
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      },
    ]);
    expect(result).toEqual(updatedTag);
    expect(result).not.toBe(updatedTag);
  });

  it('should return null when the repository returns null', async () => {
    asMock(tagRepositoryMock.update).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when update fails', async () => {
    const failure = new Error('update failure');
    asMock(tagRepositoryMock.update).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_TAG_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `UpdateTagUsecase#execute => ${failure.message}`,
    ]);
  });
});

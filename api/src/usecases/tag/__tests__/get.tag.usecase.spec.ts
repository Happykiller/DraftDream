import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { GetTagUsecase } from '@usecases/tag/get.tag.usecase';
import { GetTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetTagUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let tagRepositoryMock: BddServiceTagMongo;
  let loggerMock: LoggerMock;
  let usecase: GetTagUsecase;

  const dto: GetTagUsecaseDto = {
    id: 'tag-456',
  };

  const tag: TagUsecaseModel = {
    id: 'tag-456',
    slug: 'mobility',
    locale: 'en-US',
    label: 'Mobility',
    visibility: 'private',
    createdBy: 'coach-1',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-02-02T00:00:00.000Z'),
  };

  beforeEach(() => {
    tagRepositoryMock = {
      get: createMockFn(),
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

    usecase = new GetTagUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return the tag retrieved from the repository', async () => {
    asMock(tagRepositoryMock.get).mockResolvedValue(tag);

    const result = await usecase.execute(dto);

    expect(asMock(tagRepositoryMock.get).mock.calls[0]).toEqual([
      {
        id: dto.id,
      },
    ]);
    expect(result).toEqual(tag);
    expect(result).not.toBe(tag);
  });

  it('should return null when the tag is not found', async () => {
    asMock(tagRepositoryMock.get).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('repository failure');
    asMock(tagRepositoryMock.get).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_TAG_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `GetTagUsecase#execute => ${failure.message}`,
    ]);
  });
});

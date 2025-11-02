import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { ListTagsUsecase } from '@usecases/tag/list.tags.usecase';
import { ListTagsUsecaseDto } from '@usecases/tag/tag.usecase.dto';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListTagsUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let tagRepositoryMock: BddServiceTagMongo;
  let loggerMock: LoggerMock;
  let usecase: ListTagsUsecase;

  const dto: ListTagsUsecaseDto = {
    page: 3,
    limit: 15,
    locale: 'en-US',
    visibility: 'public',
  };

  const tags: TagUsecaseModel[] = [
    {
      id: 'tag-1',
      slug: 'strength',
      locale: 'en-US',
      label: 'Strength',
      visibility: 'public',
      createdBy: 'coach-1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-10T00:00:00.000Z'),
    },
    {
      id: 'tag-2',
      slug: 'endurance',
      locale: 'en-US',
      label: 'Endurance',
      visibility: 'private',
      createdBy: 'coach-2',
      createdAt: new Date('2024-02-01T00:00:00.000Z'),
      updatedAt: new Date('2024-02-10T00:00:00.000Z'),
    },
  ];

  beforeEach(() => {
    tagRepositoryMock = {
      listTags: createMockFn(),
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

    usecase = new ListTagsUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list tags through the repository', async () => {
    asMock(tagRepositoryMock.listTags).mockResolvedValue({
      items: tags,
      total: tags.length,
      page: dto.page!,
      limit: dto.limit!,
    });

    const result = await usecase.execute(dto);

    expect(asMock(tagRepositoryMock.listTags).mock.calls[0]).toEqual([dto]);
    expect(result).toEqual({
      items: tags,
      total: tags.length,
      page: dto.page,
      limit: dto.limit,
    });
    expect(result.items[0]).not.toBe(tags[0]);
    expect(result.items[1]).not.toBe(tags[1]);
  });

  it('should call the repository with default parameters when none are provided', async () => {
    asMock(tagRepositoryMock.listTags).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await usecase.execute();

    expect(asMock(tagRepositoryMock.listTags).mock.calls[0]).toEqual([{}]);
  });

  it('should log and throw a domain error when listing fails', async () => {
    const failure = new Error('list failure');
    asMock(tagRepositoryMock.listTags).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_TAGS_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `ListTagsUsecase#execute => ${failure.message}`,
    ]);
  });
});

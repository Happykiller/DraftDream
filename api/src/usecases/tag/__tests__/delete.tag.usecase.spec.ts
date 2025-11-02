import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { DeleteTagUsecase } from '@usecases/tag/delete.tag.usecase';
import { DeleteTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteTagUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let tagRepositoryMock: BddServiceTagMongo;
  let loggerMock: LoggerMock;
  let usecase: DeleteTagUsecase;

  const dto: DeleteTagUsecaseDto = {
    id: 'tag-123',
  };

  beforeEach(() => {
    tagRepositoryMock = {
      delete: createMockFn(),
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

    usecase = new DeleteTagUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete the tag through the repository', async () => {
    asMock(tagRepositoryMock.delete).mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(asMock(tagRepositoryMock.delete).mock.calls[0]).toEqual([dto.id]);
    expect(result).toBe(true);
  });

  it('should return false when the repository returns false', async () => {
    asMock(tagRepositoryMock.delete).mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when deletion fails', async () => {
    const failure = new Error('database failure');
    asMock(tagRepositoryMock.delete).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_TAG_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `DeleteTagUsecase#execute => ${failure.message}`,
    ]);
  });
});

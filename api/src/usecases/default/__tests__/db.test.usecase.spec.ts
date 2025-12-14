import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTestMongo } from '@services/db/mongo/db.service.test.mongo';
import { DbTestUsecase } from '@usecases/default/db.test.usecase';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DbTestUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let testRepositoryMock: MockProxy<BddServiceTestMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DbTestUsecase;

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    testRepositoryMock = mock<BddServiceTestMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { test: BddServiceTestMongo }).test = testRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DbTestUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return true when database test succeeds', async () => {
    (testRepositoryMock.test as any).mockResolvedValue(true);

    const result = await usecase.execute();

    expect(testRepositoryMock.test).toHaveBeenCalledWith();
    expect(result).toBe(true);
  });

  it('should return false when database test fails gracefully', async () => {
    (testRepositoryMock.test as any).mockResolvedValue(false);

    const result = await usecase.execute();

    expect(testRepositoryMock.test).toHaveBeenCalledWith();
    expect(result).toBe(false);
  });

  it('should log and throw a domain error when the repository throws', async () => {
    const failure = new Error('ping failure');
    (testRepositoryMock.test as any).mockRejectedValue(failure);

    await expect(usecase.execute()).rejects.toThrow(ERRORS.DB_TEST_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DbTestUsecase#execute=>${failure.message}`,
    );
  });
});

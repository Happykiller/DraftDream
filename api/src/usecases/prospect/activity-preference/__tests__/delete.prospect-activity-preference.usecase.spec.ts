import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectActivityPreferenceMongo } from '@services/db/mongo/repositories/prospect/activity-preference.repository';
import { DeleteProspectActivityPreferenceUsecase } from '@usecases/prospect/activity-preference/delete.prospect-activity-preference.usecase';
import { GetProspectActivityPreferenceDto } from '@services/db/dtos/prospect/activity-preference.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteProspectActivityPreferenceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectActivityPreferenceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteProspectActivityPreferenceUsecase;

  const dto: GetProspectActivityPreferenceDto = { id: 'preference-1' };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectActivityPreferenceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectActivityPreference: BddServiceProspectActivityPreferenceMongo }).prospectActivityPreference = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteProspectActivityPreferenceUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete prospect activity preference through the repository', async () => {
    (repositoryMock.delete as any).mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(repositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should propagate repository result when delete returns false', async () => {
    (repositoryMock.delete as any).mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when repository delete fails', async () => {
    const failure = new Error('delete failure');
    (repositoryMock.delete as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_PROSPECT_ACTIVITY_PREFERENCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`DeleteProspectActivityPreferenceUsecase#execute => ${failure.message}`);
  });
});

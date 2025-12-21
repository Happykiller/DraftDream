import { beforeEach, describe, expect, it } from '@jest/globals';
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { UpdateMePasswordUsecase } from '@usecases/user/update-me-password.user.usecase';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';
import { CryptService } from '@services/crypt/crypt.service';

interface LoggerMock {
    error: (message: string) => void;
}

describe('UpdateMePasswordUsecase', () => {
    let inversifyMock: Inversify;
    let bddServiceMock: BddServiceMongo;
    let userRepositoryMock: BddServiceUserMongo;
    let cryptServiceMock: CryptService;
    let loggerMock: LoggerMock;
    let usecase: UpdateMePasswordUsecase;

    const userId = 'user-me';
    const newPassword = 'new-password';
    const hashedPassword = 'hashed-password';

    beforeEach(() => {
        userRepositoryMock = {
            updatePassword: createMockFn(),
        } as unknown as BddServiceUserMongo;

        bddServiceMock = {
            user: userRepositoryMock,
        } as unknown as BddServiceMongo;

        cryptServiceMock = {
            hash: createMockFn(),
        } as unknown as CryptService;

        loggerMock = {
            error: createMockFn(),
        };

        inversifyMock = {
            bddService: bddServiceMock,
            cryptService: cryptServiceMock,
            loggerService: loggerMock,
        } as unknown as Inversify;

        usecase = new UpdateMePasswordUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should hash the password and update it through the repository', async () => {
        asMock(cryptServiceMock.hash).mockResolvedValue(hashedPassword);
        asMock(userRepositoryMock.updatePassword).mockResolvedValue(true);

        const result = await usecase.execute(userId, newPassword);

        expect(asMock(cryptServiceMock.hash).mock.calls[0]).toEqual([{ message: newPassword }]);
        expect(asMock(userRepositoryMock.updatePassword).mock.calls[0]).toEqual([userId, hashedPassword]);
        expect(result).toBe(true);
    });

    it('should log and throw when the user does not exist', async () => {
        asMock(cryptServiceMock.hash).mockResolvedValue(hashedPassword);
        asMock(userRepositoryMock.updatePassword).mockResolvedValue(false);

        await expect(usecase.execute(userId, newPassword)).rejects.toThrow(ERRORS.USER_NOT_FOUND);

        expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
            `UpdateMePasswordUsecase#execute => ${ERRORS.USER_NOT_FOUND}`,
        ]);
    });

    it('should log and throw when the repository fails', async () => {
        const failure = new Error('update failed');
        asMock(cryptServiceMock.hash).mockResolvedValue(hashedPassword);
        asMock(userRepositoryMock.updatePassword).mockRejectedValue(failure);

        await expect(usecase.execute(userId, newPassword)).rejects.toThrow(ERRORS.UPDATE_USER_USECASE);

        expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
            `UpdateMePasswordUsecase#execute => ${failure.message}`,
        ]);
    });
});

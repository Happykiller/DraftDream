import { UpdateUserPasswordUsecase } from '@usecases/user/update-password.user.usecase';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { CryptService } from '@services/crypt/crypt.service';
import { UpdateUserPasswordUsecaseDto } from '@usecases/user/user.usecase.dto';
import { createMockFn, asMock } from '@src/test-utils/mock-helpers';
import { ERRORS } from '@src/common/ERROR';

interface LoggerMock {
    error: (message: string) => void;
}

describe('UpdateUserPasswordUsecase', () => {
    let inversifyMock: Inversify;
    let bddServiceMock: BddServiceMongo;
    let userRepositoryMock: BddServiceUserMongo;
    let cryptServiceMock: CryptService;
    let loggerMock: LoggerMock;
    let usecase: UpdateUserPasswordUsecase;

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

        usecase = new UpdateUserPasswordUsecase(inversifyMock);
    });

    it('should update the password successfully', async () => {
        const dto: UpdateUserPasswordUsecaseDto = { id: 'user-1', password: 'new-password' };
        const hashedPassword = 'hashed-password';

        asMock(cryptServiceMock.hash).mockResolvedValue(hashedPassword);
        asMock(userRepositoryMock.updatePassword).mockResolvedValue(true);

        const result = await usecase.execute(dto);

        expect(result).toBe(true);
        expect(asMock(cryptServiceMock.hash).mock.calls[0]).toEqual([{ message: dto.password }]);
        expect(asMock(userRepositoryMock.updatePassword).mock.calls[0]).toEqual([dto.id, hashedPassword]);
    });

    it('should throw USER_NOT_FOUND if user does not exist', async () => {
        const dto: UpdateUserPasswordUsecaseDto = { id: 'unknown', password: 'password' };

        asMock(cryptServiceMock.hash).mockResolvedValue('hash');
        asMock(userRepositoryMock.updatePassword).mockResolvedValue(false);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.USER_NOT_FOUND);
    });

    it('should handle repository errors', async () => {
        const dto: UpdateUserPasswordUsecaseDto = { id: 'user-1', password: 'password' };
        const error = new Error('Database down');

        asMock(cryptServiceMock.hash).mockResolvedValue('hash');
        asMock(userRepositoryMock.updatePassword).mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_USER_USECASE);
        expect(asMock(loggerMock.error).mock.calls.length).toBeGreaterThan(0);
    });
});

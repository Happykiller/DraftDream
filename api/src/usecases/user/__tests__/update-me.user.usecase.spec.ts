import { beforeEach, describe, expect, it } from '@jest/globals';
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { UpdateMeUsecase } from '@usecases/user/update-me.user.usecase';
import { UpdateMeUsecaseDto } from '@usecases/user/user.usecase.dto';
import { UserUsecaseModel } from '@usecases/user/user.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

interface LoggerMock {
    error: (message: string) => void;
}

describe('UpdateMeUsecase', () => {
    let inversifyMock: Inversify;
    let bddServiceMock: BddServiceMongo;
    let userRepositoryMock: BddServiceUserMongo;
    let loggerMock: LoggerMock;
    let usecase: UpdateMeUsecase;

    const userId = 'user-me';
    const dto: UpdateMeUsecaseDto = {
        first_name: 'Me',
        last_name: 'Self',
        email: 'me@example.com',
        phone: '+33600000000',
        address: {
            name: 'Home',
            city: 'Paris',
            code: '75000',
            country: 'FR',
        },
        company: {
            name: 'Private',
        },
    };

    const now = new Date('2024-05-05T09:00:00.000Z');

    const updatedUser: User = {
        id: userId,
        type: 'athlete',
        first_name: 'Me',
        last_name: 'Self',
        email: 'me@example.com',
        phone: '+33600000000',
        address: {
            name: 'Home',
            city: 'Paris',
            code: '75000',
            country: 'FR',
        },
        company: {
            name: 'Private',
        },
        is_active: true,
        createdBy: 'admin-1',
        createdAt: now,
        updatedAt: now,
    };

    beforeEach(() => {
        userRepositoryMock = {
            updateUser: createMockFn(),
        } as unknown as BddServiceUserMongo;

        bddServiceMock = {
            user: userRepositoryMock,
        } as unknown as BddServiceMongo;

        loggerMock = {
            error: createMockFn(),
        };

        inversifyMock = {
            bddService: bddServiceMock,
            loggerService: loggerMock,
        } as unknown as Inversify;

        usecase = new UpdateMeUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should update the current user through the repository and map the result', async () => {
        asMock(userRepositoryMock.updateUser).mockResolvedValue(updatedUser);

        const result = await usecase.execute(userId, dto);

        expect(asMock(userRepositoryMock.updateUser).mock.calls[0]).toEqual([
            userId,
            {
                first_name: dto.first_name,
                last_name: dto.last_name,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                company: dto.company,
            },
        ]);
        const expected: UserUsecaseModel = {
            id: updatedUser.id,
            type: updatedUser.type,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            address: updatedUser.address,
            company: updatedUser.company,
            is_active: updatedUser.is_active,
            createdBy: updatedUser.createdBy,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
        expect(result).toEqual(expected);
    });

    it('should log and throw when the user does not exist', async () => {
        asMock(userRepositoryMock.updateUser).mockResolvedValue(null);

        await expect(usecase.execute(userId, dto)).rejects.toThrow(ERRORS.USER_NOT_FOUND);

        expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
            `UpdateMeUsecase#execute => ${ERRORS.USER_NOT_FOUND}`,
        ]);
    });

    it('should log and throw when the repository fails', async () => {
        const failure = new Error('write failed');
        asMock(userRepositoryMock.updateUser).mockRejectedValue(failure);

        await expect(usecase.execute(userId, dto)).rejects.toThrow(ERRORS.UPDATE_USER_USECASE);

        expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
            `UpdateMeUsecase#execute => ${failure.message}`,
        ]);
    });
});

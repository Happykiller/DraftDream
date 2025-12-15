/// <reference types="jest" />
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { ProspectStatus } from '@src/common/prospect-status.enum';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { CoachAthleteUsecaseModel } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.model';
import { ConvertProspectToAthleteUsecase } from '@src/usecases/prospect/prospect/convert.prospect.usecase';
import { ProspectUsecaseModel } from '@src/usecases/prospect/prospect/prospect.usecase.model';
import { UsecaseSession } from '@src/usecases/prospect/prospect/prospect.usecase.dto';
import { UserUsecaseModel } from '@src/usecases/user/user.usecase.model';

interface LoggerMock {
    info: (message: string) => void;
    error: (message: string) => void;
}

describe('ConvertProspectToAthleteUsecase', () => {
    let inversifyMock: Inversify;
    let loggerMock: LoggerMock;
    let usecase: ConvertProspectToAthleteUsecase;
    let getProspectExecute: jest.Mock;
    let createUserExecute: jest.Mock;
    let createCoachAthleteExecute: jest.Mock;
    let updateCoachAthleteExecute: jest.Mock;
    let updateProspectExecute: jest.Mock;

    const now = new Date('2024-02-10T10:00:00.000Z');
    const session: UsecaseSession = { userId: 'admin-1', role: Role.ADMIN };

    const baseProspect: ProspectUsecaseModel = {
        id: 'prospect-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        status: ProspectStatus.LEAD,
        levelId: 'level-1',
        objectiveIds: [],
        activityPreferenceIds: [],
        medicalConditions: 'None',
        allergies: 'None',
        notes: 'Needs follow-up',
        sourceId: 'source-1',
        budget: 300,
        dealDescription: 'Standard pack',
        workflowHistory: [],
        createdBy: 'coach-1',
        createdAt: now,
        updatedAt: now,
    };

    const athlete: UserUsecaseModel = {
        id: 'athlete-1',
        type: 'athlete',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        createdAt: now,
        updatedAt: now,
        is_active: true,
        createdBy: 'coach-1',
    };

    const coachAthleteLink: CoachAthleteUsecaseModel = {
        id: 'link-1',
        coachId: 'coach-1',
        athleteId: 'athlete-1',
        startDate: now,
        is_active: true,
        note: 'Initial note',
        createdBy: 'coach-1',
        createdAt: now,
        updatedAt: now,
    };

    beforeEach(() => {
        loggerMock = {
            info: jest.fn(),
            error: jest.fn(),
        };
        getProspectExecute = jest.fn();
        createUserExecute = jest.fn();
        createCoachAthleteExecute = jest.fn();
        updateCoachAthleteExecute = jest.fn();
        updateProspectExecute = jest.fn();

        inversifyMock = {
            loggerService: loggerMock as any,
            bddService: {
                user: { getUserByEmail: jest.fn() },
                coachAthlete: { list: jest.fn() },
            },
            getProspectUsecase: { execute: getProspectExecute },
            createUserUsecase: { execute: createUserExecute },
            createCoachAthleteUsecase: { execute: createCoachAthleteExecute },
            updateCoachAthleteUsecase: { execute: updateCoachAthleteExecute },
            updateProspectUsecase: { execute: updateProspectExecute },
        } as unknown as Inversify;

        usecase = new ConvertProspectToAthleteUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('creates the athlete, logs the password, and links to the coach', async () => {
        const expectedPassword = 'temporary-password-for-tests';
        jest
            .spyOn(ConvertProspectToAthleteUsecase.prototype as any, 'generateSecurePassword')
            .mockReturnValue(expectedPassword);

        getProspectExecute.mockResolvedValue(baseProspect);
        (inversifyMock.bddService as any).user.getUserByEmail.mockResolvedValue(null);
        createUserExecute.mockResolvedValue(athlete);
        createCoachAthleteExecute.mockResolvedValue(coachAthleteLink);
        updateProspectExecute.mockResolvedValue({
            ...baseProspect,
            status: ProspectStatus.CLIENT,
        });
        (inversifyMock.bddService as any).coachAthlete.list.mockResolvedValue({ items: [], total: 0, page: 1, limit: 1 });
        (inversifyMock.bddService as any).athleteInfo = { getByUserId: jest.fn().mockResolvedValue(null) };
        (inversifyMock.createAthleteInfoUsecase as any) = { execute: jest.fn() };

        const result = await usecase.execute({ prospectId: 'prospect-1', session });

        expect(inversifyMock.createUserUsecase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'athlete',
                email: baseProspect.email,
                password: expectedPassword,
                confirm_password: expectedPassword,
                createdBy: session.userId,
            }),
        );
        expect(inversifyMock.createCoachAthleteUsecase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                coachId: baseProspect.createdBy,
                athleteId: athlete.id,
                is_active: true,
            }),
        );
        expect(inversifyMock.createAthleteInfoUsecase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: athlete.id,
                levelId: baseProspect.levelId,
                objectiveIds: baseProspect.objectiveIds,
                activityPreferenceIds: baseProspect.activityPreferenceIds,
                medicalConditions: baseProspect.medicalConditions,
                allergies: baseProspect.allergies,
                notes: baseProspect.notes,
            }),
        );
        expect(inversifyMock.updateProspectUsecase.execute).toHaveBeenCalledWith(
            expect.objectContaining({ status: ProspectStatus.CLIENT }),
        );
        expect(loggerMock.info).toHaveBeenCalledWith(
            expect.stringContaining(`Temporary athlete password for ${baseProspect.email}: ${expectedPassword}`),
        );
        expect(result).toEqual({
            prospect: { ...baseProspect, status: ProspectStatus.CLIENT },
            athlete,
            coachAthleteLink,
            createdAthlete: true,
            createdCoachAthleteLink: true,
        });
    });

    it('reactivates an existing coach-athlete link without recreating accounts', async () => {
        const inactiveLink: CoachAthleteUsecaseModel = { ...coachAthleteLink, is_active: false };

        getProspectExecute.mockResolvedValue(baseProspect);
        (inversifyMock.bddService as any).user.getUserByEmail.mockResolvedValue(athlete);
        (inversifyMock.bddService as any).coachAthlete.list.mockResolvedValue({
            items: [inactiveLink],
            total: 1,
            page: 1,
            limit: 1,
        });
        (inversifyMock.bddService as any).athleteInfo = { getByUserId: jest.fn().mockResolvedValue(null) };
        (inversifyMock.createAthleteInfoUsecase as any) = { execute: jest.fn() };
        updateCoachAthleteExecute.mockResolvedValue(coachAthleteLink);
        updateProspectExecute.mockResolvedValue({
            ...baseProspect,
            status: ProspectStatus.CLIENT,
        });

        const result = await usecase.execute({ prospectId: 'prospect-1', session });

        expect(inversifyMock.createUserUsecase.execute).not.toHaveBeenCalled();
        expect(inversifyMock.createCoachAthleteUsecase.execute).not.toHaveBeenCalled();
        expect(inversifyMock.updateCoachAthleteUsecase.execute).toHaveBeenCalledWith({
            id: inactiveLink.id,
            is_active: true,
            endDate: undefined,
        });
        expect(loggerMock.info).not.toHaveBeenCalled();
        expect(result?.createdAthlete).toBe(false);
        expect(result?.createdCoachAthleteLink).toBe(false);
        expect(result?.coachAthleteLink).toEqual(coachAthleteLink);
    });

    it('normalizes errors when the email belongs to a non-athlete user', async () => {
        getProspectExecute.mockResolvedValue(baseProspect);
        (inversifyMock.bddService as any).user.getUserByEmail.mockResolvedValue({ ...athlete, type: 'coach' });

        await expect(usecase.execute({ prospectId: 'prospect-1', session })).rejects.toThrow(
            ERRORS.CONVERT_PROSPECT_USECASE,
        );
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining('ConvertProspectToAthleteUsecase#execute'));
    });
});

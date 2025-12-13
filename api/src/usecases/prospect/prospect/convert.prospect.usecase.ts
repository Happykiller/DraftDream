// src/usecases/prospect/prospect/convert.prospect.usecase.ts
import { randomBytes } from 'crypto';

import { ERRORS } from '@src/common/ERROR';
import { ProspectStatus } from '@src/common/prospect-status.enum';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { CoachAthleteUsecaseModel } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.model';
import { ConvertProspectToAthleteUsecaseDto } from '@src/usecases/prospect/prospect/prospect.usecase.dto';
import { ProspectConversionUsecaseResult, ProspectUsecaseModel } from '@src/usecases/prospect/prospect/prospect.usecase.model';
import { UserUsecaseModel } from '@src/usecases/user/user.usecase.model';
import { User } from '@services/db/models/user.model';

/**
 * Converts a prospect into an athlete account and links it to the owning coach.
 */
export class ConvertProspectToAthleteUsecase {
  private static readonly PASSWORD_LENGTH = 32;

  constructor(private readonly inversify: Inversify) { }

  /**
   * Creates the athlete account (if needed), links it to the coach, and updates the prospect status.
   */
  async execute(dto: ConvertProspectToAthleteUsecaseDto): Promise<ProspectConversionUsecaseResult | null> {
    try {
      const prospect = await this.inversify.getProspectUsecase.execute({
        id: dto.prospectId,
        session: dto.session,
      });
      if (!prospect) {
        return null;
      }

      const email = this.normalizeEmail(prospect.email);
      if (!email) {
        throw new Error('INVALID_PROSPECT_EMAIL');
      }

      const coachId = prospect.createdBy;
      if (!coachId) {
        throw new Error('INVALID_PROSPECT_OWNER');
      }

      const athleteResult = await this.ensureAthleteAccount({
        prospect,
        email,
        createdBy: dto.session.userId,
      });

      const coachAthleteLinkResult = await this.ensureCoachAthleteLink({
        coachId,
        athleteId: athleteResult.athlete.id,
        createdBy: dto.session.userId,
        note: prospect.notes,
      });

      const updatedProspect = await this.updateProspectStatusToClient(prospect);

      return {
        prospect: updatedProspect,
        athlete: athleteResult.athlete,
        coachAthleteLink: coachAthleteLinkResult.link,
        createdAthlete: athleteResult.created,
        createdCoachAthleteLink: coachAthleteLinkResult.created,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ConvertProspectToAthleteUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.CONVERT_PROSPECT_USECASE);
    }
  }

  /**
   * Ensures an athlete account exists for the provided prospect email.
   */
  private async ensureAthleteAccount(params: {
    prospect: ProspectUsecaseModel;
    email: string;
    createdBy: string;
  }): Promise<{ athlete: UserUsecaseModel; created: boolean }> {
    const existing = await this.inversify.bddService.user.getUserByEmail(params.email);
    if (existing) {
      if (existing.type !== 'athlete') {
        throw new Error('EMAIL_ALREADY_USED_BY_NON_ATHLETE');
      }
      return { athlete: this.mapUserToUsecaseModel(existing), created: false };
    }

    const password = this.generateSecurePassword();
    const athlete = await this.inversify.createUserUsecase.execute({
      type: 'athlete',
      first_name: params.prospect.firstName,
      last_name: params.prospect.lastName,
      email: params.email,
      phone: params.prospect.phone,
      is_active: true,
      password,
      confirm_password: password,
      createdBy: params.createdBy,
    });

    return { athlete, created: true };
  }

  /**
   * Ensures a coach-athlete link exists and is active.
   */
  private async ensureCoachAthleteLink(params: {
    coachId: string;
    athleteId: string;
    createdBy: string;
    note?: string;
  }): Promise<{ link: CoachAthleteUsecaseModel; created: boolean }> {
    const existing = await this.findExistingCoachAthleteLink(params.coachId, params.athleteId);
    if (existing) {
      if (!existing.is_active) {
        const reactivated = await this.inversify.updateCoachAthleteUsecase.execute({
          id: existing.id,
          is_active: true,
          endDate: undefined,
        });
        if (reactivated) {
          return { link: reactivated, created: false };
        }
      }
      return { link: existing, created: false };
    }

    const created = await this.inversify.createCoachAthleteUsecase.execute({
      coachId: params.coachId,
      athleteId: params.athleteId,
      startDate: new Date(),
      is_active: true,
      note: params.note,
      createdBy: params.createdBy,
    });

    if (!created) {
      throw new Error('COACH_ATHLETE_LINK_CREATION_FAILED');
    }

    return { link: created, created: true };
  }

  /**
   * Forces the prospect status to CLIENT to reflect successful conversion.
   */
  private async updateProspectStatusToClient(prospect: ProspectUsecaseModel): Promise<ProspectUsecaseModel> {
    if (prospect.status === ProspectStatus.CLIENT) {
      return prospect;
    }

    const updated = await this.inversify.updateProspectUsecase.execute({
      id: prospect.id,
      status: ProspectStatus.CLIENT,
    });

    return updated ?? prospect;
  }

  private async findExistingCoachAthleteLink(
    coachId: string,
    athleteId: string,
  ): Promise<CoachAthleteUsecaseModel | null> {
    const result = await this.inversify.bddService.coachAthlete.list({
      coachId,
      athleteId,
      limit: 1,
      page: 1,
    });

    return result.items[0] ?? null;
  }

  private mapUserToUsecaseModel(user: User): UserUsecaseModel {
    return {
      id: user.id,
      type: user.type,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      company: user.company,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      is_active: user.is_active,
      createdBy: user.createdBy,
    };
  }

  private generateSecurePassword(): string {
    return randomBytes(ConvertProspectToAthleteUsecase.PASSWORD_LENGTH)
      .toString('base64')
      .slice(0, ConvertProspectToAthleteUsecase.PASSWORD_LENGTH);
  }

  private normalizeEmail(value?: string): string | undefined {
    return value?.trim().toLowerCase();
  }
}

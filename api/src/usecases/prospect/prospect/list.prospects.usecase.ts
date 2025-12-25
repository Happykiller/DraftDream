// src/usecases/prospect/prospect/list.prospects.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
import { User } from '@services/db/models/user.model';

import { ProspectUsecaseModel } from './prospect.usecase.model';
import { ListProspectsUsecaseDto } from './prospect.usecase.dto';

interface ListProspectsResult {
  items: ProspectUsecaseModel[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Lists prospects with visibility constraints and related athlete insights.
 */
export class ListProspectsUsecase {
  constructor(private readonly inversify: Inversify) {}

  /**
   * Applies session-based visibility and enriches prospects with athlete data.
   */
  async execute(dto: ListProspectsUsecaseDto): Promise<ListProspectsResult> {
    try {
      const { session, ...filters } = dto;
      const createdBy = session.role === Role.ADMIN ? filters.createdBy : session.userId;

      const result = await this.inversify.bddService.prospect.list({
        q: filters.q,
        status: filters.status,
        levelId: filters.levelId,
        sourceId: filters.sourceId,
        createdBy,
        limit: filters.limit,
        page: filters.page,
      });

      const items = result.items.map((item) => ({ ...item }));
      await this.attachCoachAthleteInfo(items, session);

      return {
        items,
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error: any) {
      this.inversify.loggerService.error(`ListProspectsUsecase#execute => ${error?.message ?? error}`);
      throw normalizeError(error, ERRORS.LIST_PROSPECTS_USECASE);
    }
  }

  /**
   * Cross-checks existing athletes and coach-athlete links to enrich prospect records.
   */
  private async attachCoachAthleteInfo(items: ProspectUsecaseModel[], session: ListProspectsUsecaseDto['session']) {
    if (!items.length) return;

    const athletesByEmail = await this.findAthletesByEmail(items.map((item) => item.email));
    const coachId = session.role === Role.COACH ? session.userId : null;
    const linkCache = new Map<string, string | null>();

    for (const item of items) {
      const normalizedEmail = this.normalizeEmail(item.email);
      if (!normalizedEmail) continue;

      const athlete = athletesByEmail.get(normalizedEmail);
      if (!athlete) continue;

      item.matchedAthleteId = athlete.id;

      if (!coachId) continue;

      const cacheKey = `${coachId}:${athlete.id}`;
      if (!linkCache.has(cacheKey)) {
        const linkId = await this.findCoachAthleteLinkId(coachId, athlete.id);
        linkCache.set(cacheKey, linkId ?? null);
      }

      const cachedLinkId = linkCache.get(cacheKey);
      if (cachedLinkId) {
        item.coachAthleteLinkId = cachedLinkId;
      }
    }
  }

  /**
   * Builds a lookup map of athlete users by normalized email.
   */
  private async findAthletesByEmail(emails: string[]): Promise<Map<string, User>> {
    const normalizedEmails = Array.from(
      new Set(
        emails
          .map((email) => this.normalizeEmail(email))
          .filter((email): email is string => Boolean(email)),
      ),
    );
    if (!normalizedEmails.length) return new Map();

    const lookups = await Promise.all(
      normalizedEmails.map(async (email) => {
        const user = await this.inversify.bddService.user.getUserByEmail(email);
        return user?.type === 'athlete' ? [email, user] as const : null;
      }),
    );

    return lookups.reduce((acc, entry) => {
      if (entry) {
        acc.set(entry[0], entry[1]);
      }
      return acc;
    }, new Map<string, User>());
  }

  /**
   * Returns the active coach-athlete link identifier when one exists.
   */
  private async findCoachAthleteLinkId(coachId: string, athleteId: string): Promise<string | undefined> {
    const result = await this.inversify.bddService.coachAthlete.list({
      coachId,
      athleteId,
      is_active: true,
      limit: 1,
      page: 1,
    });

    return result.items[0]?.id;
  }

  private normalizeEmail(value?: string): string | undefined {
    return value?.trim().toLowerCase();
  }
}

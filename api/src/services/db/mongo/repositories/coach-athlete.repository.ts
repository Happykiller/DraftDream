// src/services/db/mongo/repositories/coach-athlete.repository.ts
import {
  Collection,
  Db,
  Filter,
  ObjectId,
  Sort,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { CoachAthleteLink } from '@services/db/models/coach-athlete.model';
import {
  CreateCoachAthleteLinkDto,
  GetCoachAthleteLinkDto,
  ListCoachAthleteLinksDto,
  UpdateCoachAthleteLinkDto,
} from '@services/db/dtos/coach-athlete.dto';

interface CoachAthleteDoc {
  _id: ObjectId;
  coachId: string;
  athleteId: string;
  startDate: Date;
  endDate?: Date;
  is_active: boolean;
  note?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  schemaVersion: number;
}

/**
 * MongoDB repository dedicated to coach-athlete relations.
 */
export class BddServiceCoachAthleteMongo {
  private col(): Collection<CoachAthleteDoc> {
    return inversify.mongo.collection<CoachAthleteDoc>('coach_athletes');
  }

  /**
   * Ensures indexes exist when the service starts or during migrations.
   */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<CoachAthleteDoc>('coach_athletes') : this.col();
      await collection.createIndexes([
        {
          key: { coachId: 1, athleteId: 1 },
          name: 'coach_athletes_unique_pair',
          unique: true,
          partialFilterExpression: { deletedAt: { $exists: false } },
        },
        { key: { coachId: 1 }, name: 'coach_athletes_coachId' },
        { key: { athleteId: 1 }, name: 'coach_athletes_athleteId' },
        { key: { is_active: 1 }, name: 'coach_athletes_is_active' },
        { key: { updatedAt: -1 }, name: 'coach_athletes_updatedAt' },
        { key: { deletedAt: 1 }, name: 'coach_athletes_deletedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /**
   * Persists a new coach-athlete relation.
   */
  async create(dto: CreateCoachAthleteLinkDto): Promise<CoachAthleteLink | null> {
    const now = new Date();
    const startDate = this.normalizeDate(dto.startDate);
    if (!startDate) {
      throw new Error('INVALID_START_DATE');
    }

    const doc: Omit<CoachAthleteDoc, '_id'> = {
      coachId: this.normalizeId(dto.coachId),
      athleteId: this.normalizeId(dto.athleteId),
      startDate,
      endDate: this.normalizeDate(dto.endDate),
      is_active: dto.is_active ?? true,
      note: this.normalizeNote(dto.note),
      createdBy: this.normalizeId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };

    try {
      const res = await this.col().insertOne(doc as CoachAthleteDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /**
   * Retrieves a relation by its identifier.
   */
  async get(dto: GetCoachAthleteLinkDto): Promise<CoachAthleteLink | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /**
   * Lists relations matching the requested filters.
   */
  async list(params: ListCoachAthleteLinksDto = {}) {
    const {
      coachId,
      athleteId,
      is_active,
      createdBy,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 } as Record<string, 1 | -1>,
    } = params;

    const filter: Filter<CoachAthleteDoc> = {};
    if (coachId?.trim()) filter.coachId = coachId.trim();
    if (athleteId?.trim()) filter.athleteId = athleteId.trim();
    if (createdBy?.trim()) filter.createdBy = createdBy.trim();
    if (typeof is_active === 'boolean') filter.is_active = is_active;
    if (!includeArchived) {
      filter.deletedAt = { $exists: false } as Filter<CoachAthleteDoc>['deletedAt'];
    }

    try {
      const cursor = this.col()
        .find(filter)
        .sort(sort as Sort)
        .skip((page - 1) * limit)
        .limit(limit);
      const [rows, total] = await Promise.all([
        cursor.toArray(),
        this.col().countDocuments(filter),
      ]);

      return {
        items: rows.map((doc) => this.toModel(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  /**
   * Applies partial updates to an existing relation.
   */
  async update(id: string, patch: UpdateCoachAthleteLinkDto): Promise<CoachAthleteLink | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<CoachAthleteDoc> = { updatedAt: new Date() };
    const $unset: Record<string, ''> = {};

    if (patch.coachId !== undefined) $set.coachId = this.normalizeId(patch.coachId);
    if (patch.athleteId !== undefined) $set.athleteId = this.normalizeId(patch.athleteId);
    if (patch.startDate !== undefined) {
      const normalized = this.normalizeDate(patch.startDate);
      if (!normalized) throw new Error('INVALID_START_DATE');
      $set.startDate = normalized;
    }
    if (patch.endDate !== undefined) {
      const normalized = this.normalizeDate(patch.endDate ?? undefined);
      if (normalized) {
        $set.endDate = normalized;
      } else {
        $unset.endDate = '';
      }
    }
    if (patch.is_active !== undefined) $set.is_active = patch.is_active;
    if (patch.note !== undefined) {
      const normalized = this.normalizeNote(patch.note ?? undefined);
      if (normalized !== undefined) {
        $set.note = normalized;
      } else {
        $unset.note = '';
      }
    }

    try {
      const result = await this.col().findOneAndUpdate(
        { _id },
        Object.keys($unset).length ? { $set, $unset } : { $set },
        { returnDocument: 'after' },
      );
      return result ? this.toModel(result) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  /**
   * Soft deletes a relation by stamping deletedAt when not already deleted.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const now = new Date();
      const res = await this.col().updateOne(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: now, updatedAt: now } },
      );
      return res.modifiedCount === 1;
    } catch (error) {
      this.handleError('delete', error);
    }
  }

  /**
   * Hard delete: permanently removes coach-athlete link from database.
   * This operation is irreversible.
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await this.col().deleteOne({ _id });
      return res.deletedCount === 1;
    } catch (error) {
      this.handleError('hardDelete', error);
    }
  }

  private toModel(doc: CoachAthleteDoc): CoachAthleteLink {
    return {
      id: doc._id.toHexString(),
      coachId: doc.coachId,
      athleteId: doc.athleteId,
      startDate: doc.startDate,
      endDate: doc.endDate,
      is_active: doc.is_active,
      note: doc.note,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
      schemaVersion: doc.schemaVersion,
    };
  }

  private normalizeId(value: string): string {
    return value?.trim();
  }

  private normalizeNote(value?: string | null): string | undefined {
    if (value === undefined || value === null) return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizeDate(value?: Date | string | null): Date | undefined {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  }

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceCoachAthleteMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

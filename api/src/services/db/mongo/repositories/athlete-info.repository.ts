// src/services/db/mongo/repositories/athlete-info.repository.ts
import {
  Collection,
  Db,
  Filter,
  ObjectId,
  Sort,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { AthleteInfo } from '@services/db/models/athlete-info.model';
import {
  CreateAthleteInfoDto,
  GetAthleteInfoDto,
  ListAthleteInfosDto,
  UpdateAthleteInfoDto,
} from '@services/db/dtos/athlete-info.dto';

interface AthleteInfoDoc {
  _id: ObjectId;
  userId: string;
  levelId?: string;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  schemaVersion: number;
}

/**
 * MongoDB repository managing athlete info sheets.
 */
export class BddServiceAthleteInfoMongo {
  private col(): Collection<AthleteInfoDoc> {
    return inversify.mongo.collection<AthleteInfoDoc>('athlete_infos');
  }

  /**
   * Ensures indexes exist for athlete info documents.
   */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<AthleteInfoDoc>('athlete_infos') : this.col();
      await collection.createIndexes([
        {
          key: { userId: 1 },
          name: 'athlete_infos_userId_unique',
          unique: true,
          partialFilterExpression: { deletedAt: { $eq: null } },
        },
        { key: { createdBy: 1 }, name: 'athlete_infos_createdBy' },
        { key: { updatedAt: -1 }, name: 'athlete_infos_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /**
   * Persists a new athlete info sheet.
   */
  async create(dto: CreateAthleteInfoDto): Promise<AthleteInfo | null> {
    const userId = this.normalizeId(dto.userId);
    const createdBy = this.normalizeId(dto.createdBy);
    if (!userId || !createdBy) {
      throw new Error('INVALID_USER_ID');
    }

    const now = new Date();
    const doc: Omit<AthleteInfoDoc, '_id'> = {
      userId,
      levelId: this.normalizeOptional(dto.levelId),
      objectiveIds: this.normalizeIds(dto.objectiveIds) ?? [],
      activityPreferenceIds: this.normalizeIds(dto.activityPreferenceIds) ?? [],
      medicalConditions: this.normalizeOptional(dto.medicalConditions),
      allergies: this.normalizeOptional(dto.allergies),
      notes: this.normalizeOptional(dto.notes),
      createdBy,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };

    try {
      const res = await this.col().insertOne(doc as AthleteInfoDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /**
   * Retrieves an athlete info sheet by identifier.
   */
  async get(dto: GetAthleteInfoDto): Promise<AthleteInfo | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id, deletedAt: { $exists: false } });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /**
   * Retrieves an athlete info sheet by user identifier.
   */
  async getByUserId(userId: string): Promise<AthleteInfo | null> {
    try {
      if (!userId) {
        throw new Error('INVALID_USER_ID');
      }
      const doc = await this.col().findOne({ userId, deletedAt: { $exists: false } });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('getByUserId', error);
    }
  }

  /**
   * Lists athlete info sheets matching filters.
   */
  async list(params: ListAthleteInfosDto = {}) {
    const {
      userId,
      createdBy,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 } as Record<string, 1 | -1>,
    } = params;

    const filter: Filter<AthleteInfoDoc> = {};
    if (userId?.trim()) filter.userId = userId.trim();
    if (params.userIds?.length) {
      const normalized = params.userIds.map((id) => id.trim()).filter(Boolean);
      if (normalized.length) {
        filter.userId = { $in: normalized } as any;
      }
    }
    if (createdBy?.trim()) filter.createdBy = createdBy.trim();
    if (!includeArchived) filter.deletedAt = { $exists: false } as any;

    try {
      const collection = this.col();
      const cursor = collection
        .find(filter)
        .sort(sort as Sort)
        .skip((page - 1) * limit)
        .limit(limit);
      const [rows, total] = await Promise.all([
        cursor.toArray(),
        collection.countDocuments(filter),
      ]);

      return {
        items: rows.map(this.toModel),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  /**
   * Applies partial updates to an athlete info sheet.
   */
  async update(id: string, patch: UpdateAthleteInfoDto): Promise<AthleteInfo | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<AthleteInfoDoc> = { updatedAt: new Date() };
    const $unset: Record<string, ''> = {};

    if (patch.userId !== undefined) {
      const normalized = this.normalizeId(patch.userId);
      if (!normalized) throw new Error('INVALID_USER_ID');
      $set.userId = normalized;
    }
    if (patch.levelId !== undefined) {
      const normalized = this.normalizeOptional(patch.levelId);
      if (normalized !== undefined) $set.levelId = normalized; else $unset.levelId = '';
    }
    if (patch.objectiveIds !== undefined) {
      $set.objectiveIds = this.normalizeIds(patch.objectiveIds) ?? [];
    }
    if (patch.activityPreferenceIds !== undefined) {
      $set.activityPreferenceIds = this.normalizeIds(patch.activityPreferenceIds) ?? [];
    }
    if (patch.medicalConditions !== undefined) {
      const normalized = this.normalizeOptional(patch.medicalConditions);
      if (normalized !== undefined) $set.medicalConditions = normalized; else $unset.medicalConditions = '';
    }
    if (patch.allergies !== undefined) {
      const normalized = this.normalizeOptional(patch.allergies);
      if (normalized !== undefined) $set.allergies = normalized; else $unset.allergies = '';
    }
    if (patch.notes !== undefined) {
      const normalized = this.normalizeOptional(patch.notes);
      if (normalized !== undefined) $set.notes = normalized; else $unset.notes = '';
    }

    try {
      const updated = await this.col().findOneAndUpdate(
        { _id, deletedAt: { $exists: false } },
        Object.keys($unset).length ? { $set, $unset } : { $set },
        { returnDocument: 'after' },
      );
      return updated ? this.toModel(updated) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  /**
   * Soft deletes an athlete info sheet.
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
   * Permanently removes an athlete info sheet.
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

  private normalizeId(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed?.length ? trimmed : undefined;
  }

  private normalizeOptional(value?: string | null): string | undefined {
    if (value === undefined || value === null) return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizeIds(values?: string[] | null): string[] | undefined {
    if (!Array.isArray(values)) return undefined;
    const cleaned = values
      .map((val) => val?.trim())
      .filter((val): val is string => Boolean(val));
    if (!cleaned.length) return [];
    return Array.from(new Set(cleaned));
  }

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  }

  private toModel = (doc: AthleteInfoDoc): AthleteInfo => ({
    id: doc._id.toHexString(),
    userId: doc.userId,
    levelId: doc.levelId,
    objectiveIds: doc.objectiveIds ?? [],
    activityPreferenceIds: doc.activityPreferenceIds ?? [],
    medicalConditions: doc.medicalConditions,
    allergies: doc.allergies,
    notes: doc.notes,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
    schemaVersion: doc.schemaVersion,
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceAthleteInfoMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

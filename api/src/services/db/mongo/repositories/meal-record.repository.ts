// src/services/db/mongo/repositories/meal-record.repository.ts
import {
  Collection,
  Db,
  DeleteResult,
  Filter,
  ObjectId,
  Sort,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { MealRecordState } from '@src/common/meal-record-state.enum';
import { MealRecord } from '@services/db/models/meal-record.model';
import type { MealPlanMealSnapshot } from '@services/db/models/meal-plan.model';
import {
  CreateMealRecordDto,
  GetMealRecordDto,
  ListMealRecordsDto,
  UpdateMealRecordDto,
} from '@services/db/dtos/meal-record.dto';

interface MealRecordDoc {
  _id: ObjectId;
  userId: string;
  mealPlanId: string;
  mealDayId: string;
  mealId: string;
  mealSnapshot?: MealPlanMealSnapshot;
  state: MealRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  schemaVersion: number;
}

/**
 * MongoDB repository for tracking athlete meal plan meal execution records.
 */
export class BddServiceMealRecordMongo {
  private col(): Collection<MealRecordDoc> {
    return inversify.mongo.collection<MealRecordDoc>('meal_records');
  }

  /**
   * Ensures indexes exist for meal record documents.
   */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<MealRecordDoc>('meal_records') : this.col();
      await collection.createIndexes([
        { key: { userId: 1 }, name: 'meal_records_userId' },
        { key: { mealPlanId: 1 }, name: 'meal_records_mealPlanId' },
        { key: { mealDayId: 1 }, name: 'meal_records_mealDayId' },
        { key: { mealId: 1 }, name: 'meal_records_mealId' },
        { key: { state: 1 }, name: 'meal_records_state' },
        { key: { updatedAt: -1 }, name: 'meal_records_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /**
   * Persists a new meal record.
   */
  async create(dto: CreateMealRecordDto): Promise<MealRecord | null> {
    const userId = this.normalizeId(dto.userId);
    const mealPlanId = this.normalizeId(dto.mealPlanId);
    const mealDayId = this.normalizeId(dto.mealDayId);
    const mealId = this.normalizeId(dto.mealId);
    const createdBy = this.normalizeId(dto.createdBy);
    if (!userId || !mealPlanId || !mealDayId || !mealId || !createdBy) {
      throw new Error('INVALID_MEAL_RECORD_REFERENCE');
    }

    const now = new Date();
    const doc: Omit<MealRecordDoc, '_id'> = {
      userId,
      mealPlanId,
      mealDayId,
      mealId,
      mealSnapshot: dto.mealSnapshot,
      state: dto.state,
      createdBy,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 2,
    };

    try {
      const res = await this.col().insertOne(doc as MealRecordDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as MealRecordDoc);
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /**
   * Retrieves a meal record by its identifier.
   */
  async get(dto: GetMealRecordDto): Promise<MealRecord | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id, deletedAt: { $exists: false } });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /**
   * Lists meal records matching provided filters.
   */
  async list(params: ListMealRecordsDto = {}) {
    const {
      userId,
      mealPlanId,
      mealDayId,
      mealId,
      state,
      createdBy,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 } as Record<string, 1 | -1>,
    } = params;

    const filter: Filter<MealRecordDoc> = {};
    if (userId?.trim()) filter.userId = userId.trim();
    if (mealPlanId?.trim()) filter.mealPlanId = mealPlanId.trim();
    if (mealDayId?.trim()) filter.mealDayId = mealDayId.trim();
    if (mealId?.trim()) filter.mealId = mealId.trim();
    if (state) filter.state = state;
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
   * Updates the record state for the given identifier.
   */
  async update(id: string, patch: UpdateMealRecordDto): Promise<MealRecord | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<MealRecordDoc> = { updatedAt: new Date() };

    if (patch.state !== undefined) {
      $set.state = patch.state;
    }

    try {
      const updated = await this.col().findOneAndUpdate(
        { _id, deletedAt: { $exists: false } },
        { $set },
        { returnDocument: 'after' },
      );
      return updated ? this.toModel(updated) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  /**
   * Soft deletes a meal record by setting deletedAt.
   */
  async softDelete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    try {
      const res = await this.col().updateOne(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: new Date() } },
      );
      return res.modifiedCount > 0;
    } catch (error) {
      this.handleError('softDelete', error);
    }
  }

  /**
   * Hard deletes a meal record effectively removing it from the database.
   */
  async hardDelete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    try {
      const res: DeleteResult = await this.col().deleteOne({ _id });
      return res.deletedCount > 0;
    } catch (error) {
      this.handleError('hardDelete', error);
    }
  }

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new Error('INVALID_ID');
    }
    return new ObjectId(id);
  }

  private toModel(doc: MealRecordDoc): MealRecord {
    return {
      id: doc._id.toHexString(),
      userId: doc.userId,
      mealPlanId: doc.mealPlanId,
      mealDayId: doc.mealDayId,
      mealId: doc.mealId,
      mealSnapshot: doc.mealSnapshot,
      state: doc.state,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }

  private normalizeId(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed?.length ? trimmed : undefined;
  }

  private isDuplicateError(error: any): boolean {
    return error?.code === 11000;
  }

  private handleError(method: string, error: any): never {
    const message = error?.message ?? error;
    inversify.loggerService.error(`[meal-record.repository] ${method} => ${message}`);
    throw error;
  }
}

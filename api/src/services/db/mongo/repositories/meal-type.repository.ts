// src/services/db/mongo/repositories/meal-type.repository.ts
import {
  Collection,
  Db,
  ObjectId,
} from 'mongodb';

import inversify from '@src/inversify/investify';
import { MealType } from '@services/db/models/meal-type.model';
import {
  CreateMealTypeDto,
  GetMealTypeDto,
  ListMealTypesDto,
  UpdateMealTypeDto,
} from '@services/db/dtos/meal-type.dto';

type MealTypeDoc = {
  _id: ObjectId;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

/** Mongo repository providing CRUD operations for meal types. */
export class BddServiceMealTypeMongo {
  /**
   * Provides the Mongo collection instance for meal types.
   */
  private async col(): Promise<Collection<MealTypeDoc>> {
    return inversify.mongo.collection<MealTypeDoc>('meal_types');
  }

  /**
   * Ensures indexes used by the meal types collection exist.
   */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<MealTypeDoc>('meal_types') : await this.col();
      await collection.createIndexes([
        { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /**
   * Persists a new meal type document.
   */
  async create(dto: CreateMealTypeDto): Promise<MealType | null> {
    const now = new Date();
    const doc: Omit<MealTypeDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as MealTypeDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /**
   * Retrieves a meal type by identifier.
   */
  async get(dto: GetMealTypeDto): Promise<MealType | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /**
   * Lists meal types matching filters and pagination options.
   */
  async list(params: ListMealTypesDto = {}) {
    const {
      q,
      locale,
      createdBy,
      visibility,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ slug: { $regex: regex } }, { label: { $regex: regex } }];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;
    if (visibility === 'public' || visibility === 'private') {
      filter.visibility = visibility;
    }

    try {
      const collection = await this.col();
      const cursor = collection
        .find(filter)
        .sort(sort)
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
   * Updates a meal type and returns the updated model.
   */
  async update(id: string, patch: UpdateMealTypeDto): Promise<MealType | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<MealTypeDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();

    try {
      const collection = await this.col();
      const res = await collection.updateOne({ _id }, { $set });
      if (!res.matchedCount) {
        return null;
      }

      const doc = await collection.findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  /**
   * Deletes a meal type by identifier.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await (await this.col()).deleteOne({ _id });
      return res.deletedCount === 1;
    } catch (error) {
      this.handleError('delete', error);
    }
  }

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  }

  private toModel = (doc: MealTypeDoc): MealType => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    label: doc.label,
    visibility: doc.visibility,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceMealTypeMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

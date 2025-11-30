// src/services/db/mongo/repositories/meal.repository.ts
import {
  Collection,
  Db,
  ObjectId,
} from 'mongodb';

import inversify from '@src/inversify/investify';
import { Meal } from '@services/db/models/meal.model';
import {
  CreateMealDto,
  GetMealDto,
  ListMealsDto,
  UpdateMealDto,
} from '@services/db/dtos/meal.dto';

interface MealDoc {
  _id: ObjectId;
  slug: string;
  locale: string;
  label: string;
  typeId: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Mongo repository providing CRUD operations for meals. */
export class BddServiceMealMongo {
  /**
   * Provides the Mongo collection instance for meals.
   */
  private col(): Collection<MealDoc> {
    return inversify.mongo.collection<MealDoc>('meals');
  }

  /**
   * Ensures indexes used by the meals collection exist.
   */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<MealDoc>('meals') : this.col();
      await collection.createIndexes([
        { key: { slug: 1, locale: 1 }, name: 'uniq_meal_slug_locale', unique: true },
        { key: { updatedAt: -1 }, name: 'meal_by_updatedAt' },
        { key: { typeId: 1 }, name: 'meal_by_typeId' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /**
   * Persists a new meal document.
   */
  async create(dto: CreateMealDto): Promise<Meal | null> {
    const now = new Date();
    const doc: Omit<MealDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      typeId: dto.typeId.trim(),
      foods: dto.foods.trim(),
      calories: dto.calories,
      proteinGrams: dto.proteinGrams,
      carbGrams: dto.carbGrams,
      fatGrams: dto.fatGrams,
      visibility: dto.visibility === 'public' || dto.visibility === 'hybrid' ? dto.visibility : 'private',
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (this.col()).insertOne(doc as MealDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /**
   * Retrieves a meal by identifier.
   */
  async get(dto: GetMealDto): Promise<Meal | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /**
   * Lists meals matching filters and pagination options.
   */
  async list(params: ListMealsDto = {}) {
    const {
      q,
      locale,
      typeId,
      createdBy,
      visibility,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q?.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { slug: { $regex: regex } },
        { label: { $regex: regex } },
        { foods: { $regex: regex } },
      ];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (typeId) filter.typeId = typeId.trim();
    if (createdBy) filter.createdBy = createdBy;

    if (visibility) {
      if (visibility === 'public') filter.visibility = 'public';
      else if (visibility === 'hybrid') filter.visibility = 'hybrid';
      else filter.visibility = 'private';
    }

    try {
      const collection = this.col();
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
   * Updates a meal and returns the updated model.
   */
  async update(id: string, patch: UpdateMealDto): Promise<Meal | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<MealDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.typeId !== undefined) $set.typeId = patch.typeId.trim();
    if (patch.foods !== undefined) $set.foods = patch.foods.trim();
    if (patch.calories !== undefined) $set.calories = patch.calories;
    if (patch.proteinGrams !== undefined) $set.proteinGrams = patch.proteinGrams;
    if (patch.carbGrams !== undefined) $set.carbGrams = patch.carbGrams;
    if (patch.fatGrams !== undefined) $set.fatGrams = patch.fatGrams;
    if (patch.visibility !== undefined) {
      if (patch.visibility === 'public') $set.visibility = 'public';
      else if (patch.visibility === 'hybrid') $set.visibility = 'hybrid';
      else $set.visibility = 'private';
    }

    try {
      const collection = this.col();
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
   * Deletes a meal by identifier.
   */
  /**
   * Soft delete: marks meal as deleted by setting deletedAt timestamp.
   * Preserves data for audit trail and potential recovery.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const now = new Date();
      const res = await (this.col()).updateOne(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: now, updatedAt: now } }
      );
      return res.modifiedCount === 1;
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

  private toModel = (doc: MealDoc): Meal => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    label: doc.label,
    typeId: doc.typeId,
    foods: doc.foods,
    calories: doc.calories,
    proteinGrams: doc.proteinGrams,
    carbGrams: doc.carbGrams,
    fatGrams: doc.fatGrams,
    visibility: doc.visibility,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceMealMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

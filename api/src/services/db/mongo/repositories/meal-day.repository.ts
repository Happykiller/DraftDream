// src/services/db/mongo/repositories/meal-day.repository.ts

import { Collection, Db, ObjectId } from 'mongodb';

import inversify from '@src/inversify/investify';
import {
  CreateMealDayDto,
  GetMealDayDto,
  ListMealDaysDto,
  MealDayVisibility,
  UpdateMealDayDto,
} from '@services/db/dtos/meal-day.dto';
import { MealDay } from '@services/db/models/meal-day.model';
import { normalizeVisibility } from '@src/common/enum.util';

interface MealDayDoc {
  _id: ObjectId;
  slug: string;
  locale: string;

  label: string;
  description?: string;

  mealIds: string[];

  visibility: MealDayVisibility;
  createdBy: ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class BddServiceMealDayMongo {
  private col(): Collection<MealDayDoc> {
    return inversify.mongo.collection<MealDayDoc>('meal_days');
  }

  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<MealDayDoc>('meal_days') : this.col();
      await collection.createIndexes([
        {
          key: { slug: 1, locale: 1 },
          name: 'uniq_active_slug_locale',
          unique: true,
          partialFilterExpression: { deletedAt: { $exists: false } },
        },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
        { key: { deletedAt: 1 }, name: 'by_deletedAt' },
        { key: { createdBy: 1 }, name: 'by_createdBy' },
        { key: { locale: 1 }, name: 'by_locale' },
        { key: { visibility: 1 }, name: 'by_visibility' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  async create(dto: CreateMealDayDto): Promise<MealDay | null> {
    const now = new Date();
    const doc: Omit<MealDayDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),

      label: dto.label.trim(),
      description: dto.description,

      mealIds: [...dto.mealIds],

      visibility: normalizeVisibility(dto.visibility) ?? 'PRIVATE',
      createdBy: this.toObjectId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (this.col()).insertOne(doc as MealDayDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as MealDayDoc);
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  async get(dto: GetMealDayDto): Promise<MealDay | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  async list(params: ListMealDaysDto = {}) {
    const {
      q,
      locale,
      visibility,
      createdBy,
      createdByIn,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const andConditions: Record<string, any>[] = [];
    if (q?.trim()) {
      andConditions.push({
        $or: [
          { slug: { $regex: new RegExp(q.trim(), 'i') } },
          { label: { $regex: new RegExp(q.trim(), 'i') } },
          { description: { $regex: new RegExp(q.trim(), 'i') } },
        ],
      });
    }
    if (locale) {
      andConditions.push({ locale: locale.toLowerCase().trim() });
    }

    if (visibility) {
      const normalized = normalizeVisibility(visibility);
      if (normalized) andConditions.push({ visibility: normalized });
    }

    const normalizedCreatedByIn = Array.isArray(createdByIn)
      ? createdByIn.map((id) => id?.trim()).filter((id): id is string => Boolean(id))
      : [];

    if (createdBy && normalizedCreatedByIn.length) {
      throw new Error('Cannot combine createdBy and createdByIn filters.');
    }

    if (createdBy) {
      andConditions.push({ createdBy: this.toObjectId(createdBy) });
    }
    if (!createdBy && normalizedCreatedByIn.length) {
      andConditions.push({ createdBy: { $in: normalizedCreatedByIn.map(this.toObjectId) } });
    }

    if (params.accessibleFor) {
      const { ownerId, includeCreatorIds = [] } = params.accessibleFor;
      const orConditions: Record<string, any>[] = [
        { createdBy: this.toObjectId(ownerId) },
      ];

      const extraCreators = includeCreatorIds
        .map((id) => id?.trim())
        .filter((id): id is string => Boolean(id));
      if (extraCreators.length > 0) {
        orConditions.push({
          createdBy: { $in: extraCreators.map(this.toObjectId) },
          visibility: 'PUBLIC',
        });
      }

      andConditions.push({ $or: orConditions });
    }

    if (!includeArchived) {
      andConditions.push({ deletedAt: { $exists: false } });
    }

    const filter = andConditions.length === 0
      ? {}
      : andConditions.length === 1
        ? andConditions[0]
        : { $and: andConditions };

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  async update(id: string, patch: UpdateMealDayDto): Promise<MealDay | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<MealDayDoc> = { updatedAt: new Date() };

    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.description !== undefined) $set.description = patch.description;
    if (patch.mealIds !== undefined) $set.mealIds = [...patch.mealIds];
    if (patch.visibility !== undefined) $set.visibility = normalizeVisibility(patch.visibility) ?? 'PRIVATE';

    try {
      const res: any = await (this.col()).findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' },
      );
      return res.value ? this.toModel(res.value as MealDayDoc) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const now = new Date();
      const res = await (this.col()).updateOne(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: now, updatedAt: now } },
      );
      return res.modifiedCount === 1;
    } catch (error) {
      this.handleError('delete', error);
    }
  }

  private toObjectId = (id: string): ObjectId => {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  };

  private toModel = (doc: MealDayDoc): MealDay => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,

    label: doc.label,
    description: doc.description,

    mealIds: [...(doc.mealIds ?? [])],

    visibility: normalizeVisibility(doc.visibility) ?? 'PRIVATE',
    createdBy: doc.createdBy.toHexString(),
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceMealDayMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

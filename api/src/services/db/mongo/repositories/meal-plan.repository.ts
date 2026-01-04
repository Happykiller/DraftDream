// src/services/db/mongo/repositories/meal-plan.repository.ts
import { Collection, Db, ObjectId } from 'mongodb';

import inversify from '@src/inversify/investify';
import {
  MealPlan,
  MealPlanDaySnapshot,
  MealPlanMealSnapshot,
  MealPlanMealTypeSnapshot,
} from '@services/db/models/meal-plan.model';
import {
  CreateMealPlanDto,
  GetMealPlanDto,
  ListMealPlansDto,
  MealPlanDaySnapshotDto,
  MealPlanMealSnapshotDto,
  MealPlanMealTypeSnapshotDto,
  UpdateMealPlanDto,
} from '@services/db/dtos/meal-plan.dto';

interface MealPlanMealTypeDoc {
  id?: string;
  templateMealTypeId?: string;
  slug?: string;
  locale?: string;
  label: string;
  visibility?: 'PRIVATE' | 'PUBLIC';
}

interface MealPlanMealDoc {
  id: string;
  templateMealId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  type: MealPlanMealTypeDoc;
}

interface MealPlanDayDoc {
  id: string;
  templateMealDayId?: string;
  slug?: string;
  locale?: string;
  label: string;
  description?: string;
  meals: MealPlanMealDoc[];
}

interface MealPlanDoc {
  _id: ObjectId;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  startDate?: Date;
  endDate?: Date;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days?: MealPlanDayDoc[];
  userId?: ObjectId;
  createdBy: ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class BddServiceMealPlanMongo {
  private col(): Collection<MealPlanDoc> {
    return inversify.mongo.collection<MealPlanDoc>('meal_plans');
  }

  /** Create necessary indexes for the meal plans collection. */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<MealPlanDoc>('meal_plans') : this.col();
      await collection.createIndexes([
        {
          key: { slug: 1, locale: 1 },
          name: 'uniq_active_slug_locale',
          unique: true,
          partialFilterExpression: { deletedAt: { $exists: false } },
        },
        { key: { label: 1, createdBy: 1 }, name: 'by_label_createdBy' },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
        { key: { deletedAt: 1 }, name: 'by_deletedAt' },
        { key: { createdBy: 1 }, name: 'by_createdBy' },
        { key: { userId: 1 }, name: 'by_userId' },
        { key: { locale: 1 }, name: 'by_locale' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /** Insert a new meal plan. Returns null on duplicate slug/locale (active docs). */
  async create(dto: CreateMealPlanDto): Promise<MealPlan | null> {
    const now = new Date();
    const doc: Omit<MealPlanDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      description: dto.description,
      visibility: dto.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      startDate: dto.startDate,
      endDate: dto.endDate,
      calories: Math.round(dto.calories),
      proteinGrams: Math.round(dto.proteinGrams),
      carbGrams: Math.round(dto.carbGrams),
      fatGrams: Math.round(dto.fatGrams),
      days: dto.days?.map(this.toDayDoc) ?? [],
      userId: dto.userId ? this.toObjectId(dto.userId) : undefined,
      createdBy: this.toObjectId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (this.col()).insertOne(doc as MealPlanDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as MealPlanDoc);
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /** Retrieve a single meal plan by id (includes deleted documents). */
  async get(dto: GetMealPlanDto): Promise<MealPlan | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /** Paginated list of meal plans. Excludes deleted items unless includeArchived is true. */
  async list(params: ListMealPlansDto = {}) {
    const {
      q,
      locale,
      createdBy,
      createdByIn,
      visibility,
      userId,
      includePublicVisibility,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};

    if (q?.trim()) {
      filter.$or = [
        { slug: { $regex: new RegExp(q.trim(), 'i') } },
        { label: { $regex: new RegExp(q.trim(), 'i') } },
        { description: { $regex: new RegExp(q.trim(), 'i') } },
      ];
    }

    if (locale?.trim()) {
      filter.locale = locale.trim().toLowerCase();
    }

    const normalizedCreatedByIn = Array.isArray(createdByIn)
      ? createdByIn.map((id) => id?.trim()).filter((id): id is string => Boolean(id))
      : [];

    if (createdBy && normalizedCreatedByIn.length) {
      throw new Error('Cannot combine createdBy and createdByIn filters.');
    }

    const ownershipConditions: Record<string, any>[] = [];
    if (createdBy) {
      ownershipConditions.push({ createdBy: this.toObjectId(createdBy) });
    } else if (normalizedCreatedByIn.length) {
      ownershipConditions.push({ createdBy: { $in: normalizedCreatedByIn.map(this.toObjectId) } });
    }

    if (visibility) {
      filter.visibility = visibility;
    } else if (includePublicVisibility) {
      ownershipConditions.push({ visibility: 'PUBLIC' });
    }

    if (ownershipConditions.length) {
      filter.$or = ownershipConditions;
    }

    if (userId) {
      filter.userId = this.toObjectId(userId);
    }

    if (!includeArchived) {
      filter.deletedAt = { $exists: false };
    }

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  /** Update an existing meal plan. Returns null on conflict or missing id. */
  async update(id: string, patch: UpdateMealPlanDto): Promise<MealPlan | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<MealPlanDoc> = { updatedAt: new Date() };
    const $unset: Record<string, ''> = {};

    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.description !== undefined) $set.description = patch.description;
    if (patch.visibility !== undefined) {
      $set.visibility = patch.visibility;
    }
    if (patch.startDate !== undefined) {
      if (patch.startDate === null) {
        $unset.startDate = '';
      } else {
        $set.startDate = patch.startDate;
      }
    }
    if (patch.endDate !== undefined) {
      if (patch.endDate === null) {
        $unset.endDate = '';
      } else {
        $set.endDate = patch.endDate;
      }
    }
    if (patch.calories !== undefined) $set.calories = Math.round(patch.calories);
    if (patch.proteinGrams !== undefined) $set.proteinGrams = Math.round(patch.proteinGrams);
    if (patch.carbGrams !== undefined) $set.carbGrams = Math.round(patch.carbGrams);
    if (patch.fatGrams !== undefined) $set.fatGrams = Math.round(patch.fatGrams);
    if (patch.days !== undefined) $set.days = patch.days.map(this.toDayDoc);
    if (patch.userId !== undefined) {
      if (patch.userId === null) {
        $unset.userId = '';
      } else {
        $set.userId = this.toObjectId(patch.userId);
      }
    }

    try {
      const updateDoc: Record<string, any> = { $set };
      if (Object.keys($unset).length > 0) {
        updateDoc.$unset = $unset;
      }

      const res: any = await (this.col()).findOneAndUpdate(
        { _id },
        updateDoc,
        { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value as MealPlanDoc) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  /** Soft delete a meal plan (idempotent). */
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

  private toObjectId = (id: string): ObjectId => {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  };

  private toDayDoc = (day: MealPlanDaySnapshotDto): MealPlanDayDoc => ({
    id: day.id,
    templateMealDayId: day.templateMealDayId,
    slug: day.slug,
    locale: day.locale,
    label: day.label.trim(),
    description: day.description,
    meals: (day.meals ?? []).map(this.toMealDoc),
  });

  private toMealDoc = (meal: MealPlanMealSnapshotDto): MealPlanMealDoc => ({
    id: meal.id,
    templateMealId: meal.templateMealId,
    slug: meal.slug,
    locale: meal.locale,
    label: meal.label.trim(),
    description: meal.description,
    foods: meal.foods,
    calories: Math.round(meal.calories),
    proteinGrams: Math.round(meal.proteinGrams),
    carbGrams: Math.round(meal.carbGrams),
    fatGrams: Math.round(meal.fatGrams),
    type: this.toMealTypeDoc(meal.type),
  });

  private toMealTypeDoc = (type: MealPlanMealTypeSnapshotDto): MealPlanMealTypeDoc => ({
    id: type.id,
    templateMealTypeId: type.templateMealTypeId,
    slug: type.slug,
    locale: type.locale,
    label: type.label.trim(),
    visibility: type.visibility,
  });

  private toModel = (doc: MealPlanDoc): MealPlan => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    label: doc.label,
    description: doc.description,
    visibility: (doc.visibility?.toUpperCase() as 'PRIVATE' | 'PUBLIC') ?? 'PRIVATE',
    startDate: doc.startDate,
    endDate: doc.endDate,
    calories: doc.calories,
    proteinGrams: doc.proteinGrams,
    carbGrams: doc.carbGrams,
    fatGrams: doc.fatGrams,
    days: (doc.days ?? []).map(this.toDayModel),
    userId: doc.userId ? doc.userId.toHexString() : undefined,
    createdBy: doc.createdBy.toHexString(),
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

  private toDayModel = (day: MealPlanDayDoc): MealPlanDaySnapshot => ({
    id: day.id,
    templateMealDayId: day.templateMealDayId,
    slug: day.slug,
    locale: day.locale,
    label: day.label,
    description: day.description,
    meals: (day.meals ?? []).map(this.toMealModel),
  });

  private toMealModel = (meal: MealPlanMealDoc): MealPlanMealSnapshot => ({
    id: meal.id,
    templateMealId: meal.templateMealId,
    slug: meal.slug,
    locale: meal.locale,
    label: meal.label,
    description: meal.description,
    foods: meal.foods,
    calories: meal.calories,
    proteinGrams: meal.proteinGrams,
    carbGrams: meal.carbGrams,
    fatGrams: meal.fatGrams,
    type: this.toMealTypeModel(meal.type),
  });

  private toMealTypeModel = (type: MealPlanMealTypeDoc): MealPlanMealTypeSnapshot => ({
    id: type.id,
    templateMealTypeId: type.templateMealTypeId,
    slug: type.slug,
    locale: type.locale,
    label: type.label,
    visibility: (type.visibility?.toUpperCase() as 'PRIVATE' | 'PUBLIC'),
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceMealPlanMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

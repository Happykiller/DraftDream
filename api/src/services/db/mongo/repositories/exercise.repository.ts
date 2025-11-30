// src/services/db/mongo/exercise.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';

import inversify from '@src/inversify/investify';
import { Exercise } from '@services/db/models/exercise.model';
import {
  CreateExerciseDto,
  GetExerciseDto,
  ListExercisesDto,
  UpdateExerciseDto,
} from '@services/db/dtos/exercise.dto';
import { ERRORS } from '@src/common/ERROR';
import { slugifyCandidate } from '@src/common/slug.util';

interface ExerciseDoc {
  _id: ObjectId;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  instructions?: string;
  series: string;
  repetitions: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: 'private' | 'public' | 'hybrid';

  categories: ObjectId[];
  muscles: ObjectId[];
  equipment?: ObjectId[];
  tags?: ObjectId[];

  createdBy: ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class BddServiceExerciseMongo {
  private col(): Collection<ExerciseDoc> {
    return inversify.mongo.collection<ExerciseDoc>('exercises');
  }

  /** Create all necessary indexes. */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<ExerciseDoc>('exercises') : this.col();
      await collection.createIndexes([
        // Unicity for active (non-archived) documents
        {
          key: { slug: 1, locale: 1 },
          name: 'uniq_active_slug_locale',
          unique: true,
        },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
        { key: { createdBy: 1 }, name: 'by_createdBy' },
        { key: { visibility: 1 }, name: 'by_visibility' },
        { key: { categories: 1 }, name: 'by_categories' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /**
   * Creates a new exercise with automatic slug collision resolution.
   * Attempts up to 20 slug variants by appending incremental suffixes.
   * Uses centralized slug normalization from slug.util.ts.
   * 
   * @param dto - Exercise creation data with pre-normalized slug
   * @returns Created exercise or null if all slug candidates are taken (rare)
   * @throws Error on validation failures or database errors
   */
  async create(dto: CreateExerciseDto): Promise<Exercise | null> {
    const now = new Date();

    const normalizedCategoryIds = Array.from(new Set(dto.categoryIds ?? [])).map((id) => id.trim()).filter(Boolean);
    if (!normalizedCategoryIds.length) {
      throw new Error('At least one category is required to create an exercise');
    }

    const baseDoc: Omit<ExerciseDoc, '_id' | 'slug'> = {
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      description: dto.description,
      instructions: dto.instructions,
      series: dto.series.trim(),
      repetitions: dto.repetitions.trim(),
      charge: dto.charge?.trim(),
      rest: dto.rest,
      videoUrl: dto.videoUrl,
      visibility: dto.visibility === 'public' || dto.visibility === 'hybrid' ? dto.visibility : 'private',

      categories: normalizedCategoryIds.map(this.toObjectId),
      muscles: (dto.muscleIds ?? []).map(this.toObjectId),
      equipment: dto.equipmentIds?.map(this.toObjectId),
      tags: dto.tagIds?.map(this.toObjectId),

      createdBy: this.toObjectId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
    };

    const baseSlug = slugifyCandidate(dto.slug) || 'exercise';
    const collection = this.col();

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const candidateSlug = this.buildSlugCandidate(baseSlug, attempt);
      const doc: Omit<ExerciseDoc, '_id'> = { ...baseDoc, slug: candidateSlug };

      try {
        const res = await collection.insertOne(doc as ExerciseDoc);
        return this.toModel({ _id: res.insertedId, ...doc } as ExerciseDoc);
      } catch (error) {
        if (this.isDuplicateError(error)) {
          continue;
        }
        this.handleError('create', error);
      }
    }

    return null;
  }

  /** Get by id. */
  async get(dto: GetExerciseDto): Promise<Exercise | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /** Paginated list. */
  async list(params: ListExercisesDto = {}) {
    const {
      q,
      locale,
      createdBy,
      createdByIn,
      includePublicVisibility,
      visibility,
      categoryIds,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    const andConditions: Record<string, any>[] = [];

    if (q?.trim()) {
      const search = q.trim();
      andConditions.push({
        $or: [
          { slug: { $regex: new RegExp(search, 'i') } },
          { label: { $regex: new RegExp(search, 'i') } },
          { description: { $regex: new RegExp(search, 'i') } },
        ],
      });
    }

    if (locale) filter.locale = locale.toLowerCase().trim();

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
      if (visibility === 'public') filter.visibility = 'public';
      else if (visibility === 'hybrid') filter.visibility = 'hybrid';
      else filter.visibility = 'private';
    } else if (includePublicVisibility) {
      ownershipConditions.push({ visibility: 'public' });
    }

    if (ownershipConditions.length) {
      andConditions.push({ $or: ownershipConditions });
    }

    if (andConditions.length) {
      filter.$and = andConditions;
    }

    const normalizedCategoryIds = Array.isArray(categoryIds)
      ? Array.from(new Set(categoryIds)).map((id) => id.trim()).filter(Boolean)
      : [];
    if (normalizedCategoryIds.length) {
      filter.categories = { $all: normalizedCategoryIds.map(this.toObjectId) };
    }
    filter.deletedAt = undefined;

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  /**
   * Partial update.
   * Throws when the target exercise cannot be found or when the slug collides with another exercise.
   */
  async update(id: string, patch: UpdateExerciseDto): Promise<Exercise> {
    const _id = this.toObjectId(id);
    const $set: Partial<ExerciseDoc> = { updatedAt: new Date() };

    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.description !== undefined) $set.description = patch.description;
    if (patch.instructions !== undefined) $set.instructions = patch.instructions;
    if (patch.series !== undefined) $set.series = patch.series.trim();
    if (patch.repetitions !== undefined) $set.repetitions = patch.repetitions.trim();
    if (patch.charge !== undefined) $set.charge = patch.charge?.trim();
    if (patch.rest !== undefined) $set.rest = patch.rest;
    if (patch.videoUrl !== undefined) $set.videoUrl = patch.videoUrl;
    if (patch.visibility !== undefined) {
      if (patch.visibility === 'public') $set.visibility = 'public';
      else if (patch.visibility === 'hybrid') $set.visibility = 'hybrid';
      else $set.visibility = 'private';
    }

    if (patch.categoryIds !== undefined) {
      const normalized = Array.isArray(patch.categoryIds)
        ? Array.from(new Set(patch.categoryIds)).map((id) => id.trim()).filter(Boolean)
        : [];
      if (!normalized.length) {
        throw new Error('categoryIds must contain at least one element');
      }
      $set.categories = normalized.map(this.toObjectId);
    }
    if (patch.muscleIds !== undefined) $set.muscles = patch.muscleIds.map(this.toObjectId);
    if (patch.equipmentIds !== undefined) $set.equipment = patch.equipmentIds.map(this.toObjectId);
    if (patch.tagIds !== undefined) $set.tags = patch.tagIds.map(this.toObjectId);

    try {
      const res: any = await (this.col()).findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' }
      );

      if (!res) {
        throw new Error(ERRORS.EXERCISE_UPDATE_NOT_FOUND);
      }

      return this.toModel(res);
    } catch (error: any) {
      this.handleError('update', error, ERRORS.UPDATE_EXERCISE_MONGO);
    }
  }

  /** Hard delete (use with caution). */
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

  // ---- helpers ----

  private toObjectId = (id: string): ObjectId => {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  };

  private buildSlugCandidate = (base: string, attempt: number): string => {
    if (attempt === 0) {
      return base;
    }

    const MAX_LENGTH = 60;
    const suffix = `-${attempt + 1}`;
    const maxBaseLength = Math.max(1, MAX_LENGTH - suffix.length);
    const trimmedBase = base.slice(0, maxBaseLength).replace(/-+$/g, '');
    const effectiveBase = trimmedBase || base.slice(0, maxBaseLength);
    return `${effectiveBase}${suffix}`;
  };

  private toModel = (doc: ExerciseDoc): Exercise => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    label: doc.label,
    description: doc.description,
    instructions: doc.instructions,
    series: doc.series,
    repetitions: doc.repetitions,
    charge: doc.charge,
    rest: doc.rest,
    videoUrl: doc.videoUrl,
    visibility: doc.visibility,

    // Relations are represented minimally; hydrate at service/usecase layer if needed.
    categories: (doc.categories ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '',
      locale: doc.locale,
      label: '',
      visibility: 'private',
      createdBy: '',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })),
    muscles: (doc.muscles ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '', locale: doc.locale, label: '', visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    })),
    equipment: (doc.equipment ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '', locale: doc.locale, label: '', visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    })),
    tags: (doc.tags ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '', locale: doc.locale, label: '', visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    })),

    createdBy: doc.createdBy.toHexString(),
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown, overrideMessage?: string): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceExerciseMongo#${method} => ${message}`);
    if (overrideMessage) {
      throw new Error(overrideMessage);
    }
    throw error instanceof Error ? error : new Error(message);
  }
}

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

type ExerciseDoc = {
  _id: ObjectId;
  slug: string;
  locale: string;
  name: string;
  description?: string;
  instructions?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  series: string;
  repetitions: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: 'private' | 'public';

  category: ObjectId;
  primaryMuscles: ObjectId[];
  secondaryMuscles?: ObjectId[];
  equipment?: ObjectId[];
  tags?: ObjectId[];

  createdBy: ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class BddServiceExerciseMongo {
  private async col(): Promise<Collection<ExerciseDoc>> {
    return inversify.mongo.collection<ExerciseDoc>('exercises');
  }

  /** Create all necessary indexes. */
  async ensureIndexes(db?: Db): Promise<void> {
    const collection = db ? db.collection<ExerciseDoc>('exercises') : await this.col();
    await collection.createIndexes([
      // Unicity for active (non-archived) documents
      {
        key: { slug: 1, locale: 1 },
        name: 'uniq_active_slug_locale',
        unique: true,
        partialFilterExpression: { archived: false },
      },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      { key: { archived: 1 }, name: 'by_archived' },
      { key: { createdBy: 1 }, name: 'by_createdBy' },
      { key: { visibility: 1 }, name: 'by_visibility' },
      { key: { level: 1 }, name: 'by_level' },
    ]);
  }

  /** Insert a new exercise. Returns null on duplicate slug/locale (active docs). */
  async create(dto: CreateExerciseDto): Promise<Exercise | null> {
    const now = new Date();

    const doc: Omit<ExerciseDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      name: dto.name.trim(),
      description: dto.description,
      instructions: dto.instructions,
      level: dto.level,
      series: dto.series.trim(),
      repetitions: dto.repetitions.trim(),
      charge: dto.charge?.trim(),
      rest: dto.rest,
      videoUrl: dto.videoUrl,
      visibility: dto.visibility,

      category: this.toObjectId(dto.categoryId),
      primaryMuscles: (dto.primaryMuscleIds ?? []).map(this.toObjectId),
      secondaryMuscles: dto.secondaryMuscleIds?.map(this.toObjectId),
      equipment: dto.equipmentIds?.map(this.toObjectId),
      tags: dto.tagIds?.map(this.toObjectId),

      createdBy: this.toObjectId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as ExerciseDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as ExerciseDoc);
    } catch (e: any) {
      // code 11000 => duplicate key (unique index violation)
      if (e?.code === 11000) return null;
      throw e;
    }
  }

  /** Get by id (includes archived items). */
  async get(dto: GetExerciseDto): Promise<Exercise | null> {
    try {
      const _id = new ObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch {
      return null;
    }
  }

  /** Paginated list. Excludes archived by default (includeArchived=true to include). */
  async list(params: ListExercisesDto = {}) {
    const {
      q,
      locale,
      createdBy,
      visibility,
      level,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q && q.trim()) {
      filter.$or = [
        { slug: { $regex: new RegExp(q.trim(), 'i') } },
        { name: { $regex: new RegExp(q.trim(), 'i') } },
      ];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = this.toObjectId(createdBy);
    if (visibility === 'public' || visibility === 'private') filter.visibility = visibility;
    if (level) filter.level = level;
    filter.deletedAt = undefined;

    const collection = await this.col();
    const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

    return { items: rows.map(this.toModel), total, page, limit };
  }

  /** Partial update. Returns null on unique index conflict. */
  async update(id: string, patch: UpdateExerciseDto): Promise<Exercise | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ExerciseDoc> = { updatedAt: new Date() };

    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.name !== undefined) $set.name = patch.name.trim();
    if (patch.description !== undefined) $set.description = patch.description;
    if (patch.instructions !== undefined) $set.instructions = patch.instructions;
    if (patch.level !== undefined) $set.level = patch.level;
    if (patch.series !== undefined) $set.series = patch.series.trim();
    if (patch.repetitions !== undefined) $set.repetitions = patch.repetitions.trim();
    if (patch.charge !== undefined) $set.charge = patch.charge?.trim();
    if (patch.rest !== undefined) $set.rest = patch.rest;
    if (patch.videoUrl !== undefined) $set.videoUrl = patch.videoUrl;
    if (patch.visibility !== undefined) $set.visibility = patch.visibility;

    if (patch.categoryId !== undefined) $set.category = this.toObjectId(patch.categoryId);
    if (patch.primaryMuscleIds !== undefined) $set.primaryMuscles = patch.primaryMuscleIds.map(this.toObjectId);
    if (patch.secondaryMuscleIds !== undefined) $set.secondaryMuscles = patch.secondaryMuscleIds.map(this.toObjectId);
    if (patch.equipmentIds !== undefined) $set.equipment = patch.equipmentIds.map(this.toObjectId);
    if (patch.tagIds !== undefined) $set.tags = patch.tagIds.map(this.toObjectId);

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (e: any) {
      if (e?.code === 11000) return null;
      throw e;
    }
  }

  /** Hard delete (use with caution). */
  async delete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const now = new Date();
    const res = await (await this.col()).updateOne(
      { _id, deletedAt: { $exists: false } },
      { $set: { deletedAt: now, updatedAt: now } }
    );
    return res.modifiedCount === 1;
  }

  // ---- helpers ----

  private toObjectId = (id: string): ObjectId => {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  };

  private toModel = (doc: ExerciseDoc): Exercise => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    name: doc.name,
    description: doc.description,
    instructions: doc.instructions,
    level: doc.level,
    series: doc.series,
    repetitions: doc.repetitions,
    charge: doc.charge,
    rest: doc.rest,
    videoUrl: doc.videoUrl,
    visibility: doc.visibility,

    // Relations are represented minimally; hydrate at service/usecase layer if needed.
    category: {
      id: doc.category.toHexString(),
      slug: '', locale: doc.locale, visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    },
    primaryMuscles: (doc.primaryMuscles ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '', locale: doc.locale, visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    })),
    secondaryMuscles: (doc.secondaryMuscles ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '', locale: doc.locale, visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    })),
    equipment: (doc.equipment ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '', locale: doc.locale, visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    })),
    tags: (doc.tags ?? []).map((oid) => ({
      id: oid.toHexString(),
      slug: '', locale: doc.locale, visibility: 'private',
      createdBy: '', createdAt: doc.createdAt, updatedAt: doc.updatedAt,
    })),

    createdBy: doc.createdBy.toHexString(),
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

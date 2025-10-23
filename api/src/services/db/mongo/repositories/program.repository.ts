// src\\services\\db\\mongo\\repositories\\program.repository.ts
import { Collection, Db, ObjectId } from 'mongodb';

import inversify from '@src/inversify/investify';
import {
  Program,
  ProgramExerciseSnapshot,
  ProgramSessionSnapshot,
} from '@services/db/models/program.model';
import {
  CreateProgramDto,
  GetProgramDto,
  ListProgramsDto,
  ProgramExerciseSnapshotDto,
  ProgramSessionSnapshotDto,
  UpdateProgramDto,
} from '@services/db/dtos/program.dto';

type ProgramExerciseDoc = {
  id: string;
  templateExerciseId?: string;
  label: string;
  description?: string;
  instructions?: string;
  series?: string;
  repetitions?: string;
  charge?: string;
  restSeconds?: number;
  videoUrl?: string;
  level?: string;
};

type ProgramSessionDoc = {
  id: string;
  templateSessionId?: string;
  slug?: string;
  locale?: string;
  label: string;
  durationMin: number;
  description?: string;
  exercises: ProgramExerciseDoc[];
};

type ProgramDoc = {
  _id: ObjectId;
  slug: string;
  locale: string;
  label: string;
  duration: number;
  frequency: number;
  description?: string;
  sessions?: ProgramSessionDoc[];
  userId?: ObjectId;
  createdBy: ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class BddServiceProgramMongo {
  private async col(): Promise<Collection<ProgramDoc>> {
    return inversify.mongo.collection<ProgramDoc>('programs');
  }

  /** Create all necessary indexes. */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<ProgramDoc>('programs') : await this.col();
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

  /** Insert a new program. Returns null on duplicate slug/locale (active docs). */
  async create(dto: CreateProgramDto): Promise<Program | null> {
    const now = new Date();
    const doc: Omit<ProgramDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      duration: Math.trunc(dto.duration),
      frequency: Math.trunc(dto.frequency),
      description: dto.description,
      sessions: dto.sessions?.map(this.toSessionDoc) ?? [],
      userId: dto.userId ? this.toObjectId(dto.userId) : undefined,
      createdBy: this.toObjectId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as ProgramDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as ProgramDoc);
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /** Get by id (includes deleted items). */
  async get(dto: GetProgramDto): Promise<Program | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /** Paginated list. Excludes deleted by default (unless includeArchived=true). */
  async list(params: ListProgramsDto = {}) {
    const {
      q,
      createdBy,
      userId,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q && q.trim()) {
      filter.$or = [
        { slug: { $regex: new RegExp(q.trim(), 'i') } },
        { label: { $regex: new RegExp(q.trim(), 'i') } },
        { description: { $regex: new RegExp(q.trim(), 'i') } },
      ];
    }
    if (createdBy) filter.createdBy = this.toObjectId(createdBy);
    if (userId) filter.userId = this.toObjectId(userId);
    if (!includeArchived) filter.deletedAt = { $exists: false };

    try {
      const collection = await this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  /** Partial update. Returns null on unique index conflict or if not found. */
  async update(id: string, patch: UpdateProgramDto): Promise<Program | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ProgramDoc> = { updatedAt: new Date() };

    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.duration !== undefined) $set.duration = Math.trunc(patch.duration);
    if (patch.frequency !== undefined) $set.frequency = Math.trunc(patch.frequency);
    if (patch.description !== undefined) $set.description = patch.description;
    if (patch.sessions !== undefined) $set.sessions = patch.sessions.map(this.toSessionDoc);
    if (patch.userId !== undefined) $set.userId = this.toObjectId(patch.userId);

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value as ProgramDoc) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  /** Soft delete (idempotent): sets deletedAt if not already set. */
  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const now = new Date();
      const res = await (await this.col()).updateOne(
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

  private toSessionDoc = (session: ProgramSessionSnapshotDto): ProgramSessionDoc => ({
    id: session.id,
    templateSessionId: session.templateSessionId,
    slug: session.slug,
    locale: session.locale,
    label: session.label,
    durationMin: Math.trunc(session.durationMin),
    description: session.description,
    exercises: (session.exercises ?? []).map(this.toExerciseDoc),
  });

  private toExerciseDoc = (exercise: ProgramExerciseSnapshotDto): ProgramExerciseDoc => ({
    id: exercise.id,
    templateExerciseId: exercise.templateExerciseId,
    label: exercise.label,
    description: exercise.description,
    instructions: exercise.instructions,
    series: exercise.series,
    repetitions: exercise.repetitions,
    charge: exercise.charge,
    restSeconds: exercise.restSeconds,
    videoUrl: exercise.videoUrl,
    level: exercise.level,
  });

  private toModel = (doc: ProgramDoc): Program => {
    return {
      id: doc._id.toHexString(),
      slug: doc.slug,
      locale: doc.locale,
      label: doc.label,
      duration: doc.duration,
      frequency: doc.frequency,
      description: doc.description,
      sessions: (doc.sessions ?? []).map(this.toSessionModel),
      userId: doc.userId ? doc.userId.toHexString() : undefined,
      createdBy: doc.createdBy.toHexString(),
      deletedAt: doc.deletedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  };

  private toSessionModel = (session: ProgramSessionDoc): ProgramSessionSnapshot => ({
    id: session.id,
    templateSessionId: session.templateSessionId,
    slug: session.slug,
    locale: session.locale,
    label: session.label,
    durationMin: session.durationMin,
    description: session.description,
    exercises: (session.exercises ?? []).map(this.toExerciseModel),
  });

  private toExerciseModel = (exercise: ProgramExerciseDoc): ProgramExerciseSnapshot => ({
    id: exercise.id,
    templateExerciseId: exercise.templateExerciseId,
    label: exercise.label,
    description: exercise.description,
    instructions: exercise.instructions,
    series: exercise.series,
    repetitions: exercise.repetitions,
    charge: exercise.charge,
    restSeconds: exercise.restSeconds,
    videoUrl: exercise.videoUrl,
    level: exercise.level,
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceProgramMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

// src\\services\\db\\mongo\\repositories\\program.repository.ts
import { Collection, Db, ObjectId } from 'mongodb';

import inversify from '@src/inversify/investify';
import { Program } from '@services/db/models/program.model';
import {
  CreateProgramDto,
  GetProgramDto,
  ListProgramsDto,
  UpdateProgramDto,
} from '@services/db/dtos/program.dto';

type ProgramDoc = {
  _id: ObjectId;
  name: string;
  duration: number;
  frequency: number;
  description?: string;
  sessionIds: string[];
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
    const collection = db ? db.collection<ProgramDoc>('programs') : await this.col();
    await collection.createIndexes([
      {
        key: { name: 1, createdBy: 1 },
        name: 'uniq_active_name_by_user',
        unique: true,
        partialFilterExpression: { deletedAt: { $exists: false } },
      },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      { key: { deletedAt: 1 }, name: 'by_deletedAt' },
      { key: { createdBy: 1 }, name: 'by_createdBy' },
      { key: { userId: 1 }, name: 'by_userId' },
    ]);
  }

  /** Insert a new program. Returns null on duplicate name per user (active docs). */
  async create(dto: CreateProgramDto): Promise<Program | null> {
    const now = new Date();
    const doc: Omit<ProgramDoc, '_id'> = {
      name: dto.name.trim(),
      duration: Math.trunc(dto.duration),
      frequency: Math.trunc(dto.frequency),
      description: dto.description,
      sessionIds: [...dto.sessionIds],
      userId: dto.userId ? this.toObjectId(dto.userId) : undefined,
      createdBy: this.toObjectId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as ProgramDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as ProgramDoc);
    } catch (e: any) {
      if (e?.code === 11000) return null;
      throw e;
    }
  }

  /** Get by id (includes deleted items). */
  async get(dto: GetProgramDto): Promise<Program | null> {
    try {
      const _id = new ObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch {
      return null;
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
        { name: { $regex: new RegExp(q.trim(), 'i') } },
        { description: { $regex: new RegExp(q.trim(), 'i') } },
      ];
    }
    if (createdBy) filter.createdBy = this.toObjectId(createdBy);
    if (userId) filter.userId = this.toObjectId(userId);
    if (!includeArchived) filter.deletedAt = { $exists: false };

    const collection = await this.col();
    const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

    return { items: rows.map(this.toModel), total, page, limit };
  }

  /** Partial update. Returns null on unique index conflict or if not found. */
  async update(id: string, patch: UpdateProgramDto): Promise<Program | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ProgramDoc> = { updatedAt: new Date() };

    if (patch.name !== undefined) $set.name = patch.name.trim();
    if (patch.duration !== undefined) $set.duration = Math.trunc(patch.duration);
    if (patch.frequency !== undefined) $set.frequency = Math.trunc(patch.frequency);
    if (patch.description !== undefined) $set.description = patch.description;
    if (patch.sessionIds !== undefined) $set.sessionIds = [...patch.sessionIds];
    if (patch.userId !== undefined) $set.userId = this.toObjectId(patch.userId);

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value as ProgramDoc) : null;
    } catch (e: any) {
      if (e?.code === 11000) return null;
      throw e;
    }
  }

  /** Soft delete (idempotent): sets deletedAt if not already set. */
  async delete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const now = new Date();
    const res = await (await this.col()).updateOne(
      { _id, deletedAt: { $exists: false } },
      { $set: { deletedAt: now, updatedAt: now } }
    );
    return res.modifiedCount === 1;
  }

  private toObjectId = (id: string): ObjectId => {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  };

  private toModel = (doc: ProgramDoc): Program => ({
    id: doc._id.toHexString(),
    name: doc.name,
    duration: doc.duration,
    frequency: doc.frequency,
    description: doc.description,
    sessionIds: [...(doc.sessionIds ?? [])],
    userId: doc.userId ? doc.userId.toHexString() : undefined,
    createdBy: doc.createdBy.toHexString(),
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

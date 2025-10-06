// src\services\db\mongo\repositories\session.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';

import inversify from '@src/inversify/investify';
import { Session } from '@services/db/models/session.model';
import {
  CreateSessionDto,
  GetSessionDto,
  ListSessionsDto,
  UpdateSessionDto,
} from '@services/db/dtos/session.dto';

type SessionDoc = {
  _id: ObjectId;
  slug: string;
  locale: string;

  title: string;
  durationMin: number;
  description?: string;

  exerciseIds: string[];

  createdBy: ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class BddServiceSessionMongo {
  // -- Collection accessor --
  private async col(): Promise<Collection<SessionDoc>> {
    return inversify.mongo.collection<SessionDoc>('sessions');
  }

  /** Create all necessary indexes. */
  async ensureIndexes(db?: Db): Promise<void> {
    const collection = db ? db.collection<SessionDoc>('sessions') : await this.col();
    await collection.createIndexes([
      // Unicity for active (non-deleted) documents
      {
        key: { slug: 1, locale: 1 },
        name: 'uniq_active_slug_locale',
        unique: true,
        // Only enforce uniqueness where deletedAt does not exist
        partialFilterExpression: { deletedAt: { $exists: false } },
      },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      { key: { deletedAt: 1 }, name: 'by_deletedAt' },
      { key: { createdBy: 1 }, name: 'by_createdBy' },
      { key: { locale: 1 }, name: 'by_locale' },
    ]);
  }

  /** Insert a new session. Returns null on duplicate slug/locale (active docs). */
  async create(dto: CreateSessionDto): Promise<Session | null> {
    const now = new Date();
    const doc: Omit<SessionDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),

      title: dto.title.trim(),
      durationMin: Math.trunc(dto.durationMin),
      description: dto.description,

      // Preserve order as provided
      exerciseIds: [...dto.exerciseIds],

      createdBy: this.toObjectId(dto.createdBy),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as SessionDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as SessionDoc);
    } catch (e: any) {
      // code 11000 => duplicate key (unique index violation)
      if (e?.code === 11000) return null;
      throw e;
    }
  }

  /** Get by id (includes deleted items). */
  async get(dto: GetSessionDto): Promise<Session | null> {
    try {
      const _id = new ObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch {
      return null;
    }
  }

  /** Paginated list. Excludes deleted by default (unless includeArchived=true). */
  async list(params: ListSessionsDto = {}) {
    const {
      q,
      locale,
      createdBy,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q && q.trim()) {
      filter.$or = [
        { slug: { $regex: new RegExp(q.trim(), 'i') } },
        { title: { $regex: new RegExp(q.trim(), 'i') } },
        { description: { $regex: new RegExp(q.trim(), 'i') } },
      ];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = this.toObjectId(createdBy);
    if (!includeArchived) filter.deletedAt = { $exists: false };

    const collection = await this.col();
    const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

    return { items: rows.map(this.toModel), total, page, limit };
  }

  /** Partial update. Returns null on unique index conflict or if not found. */
  async update(id: string, patch: UpdateSessionDto): Promise<Session | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<SessionDoc> = { updatedAt: new Date() };

    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.title !== undefined) $set.title = patch.title.trim();
    if (patch.durationMin !== undefined) $set.durationMin = Math.trunc(patch.durationMin);
    if (patch.description !== undefined) $set.description = patch.description;
    if (patch.exerciseIds !== undefined) $set.exerciseIds = [...patch.exerciseIds];

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value as SessionDoc) : null;
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

  // ---- helpers ----

  private toObjectId = (id: string): ObjectId => {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  };

  private toModel = (doc: SessionDoc): Session => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,

    title: doc.title,
    durationMin: doc.durationMin,
    description: doc.description,

    // Relations are represented minimally; hydrate elsewhere if needed.
    exerciseIds: [...(doc.exerciseIds ?? [])],

    createdBy: doc.createdBy.toHexString(),
    deletedAt: doc.deletedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

// src/services/db/mongo/tag.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';
import inversify from '@src/inversify/investify';
import { Tag } from '@services/db/models/tag.model';
import {
  CreateTagDto, GetTagDto, ListTagsDto, UpdateTagDto,
} from '@services/db/dtos/tag.dto';
import { normalizeVisibility } from '@src/common/enum.util';

interface TagDoc {
  _id: ObjectId;
  slug: string;
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class BddServiceTagMongo {
  // Get collection handle
  private col(): Collection<TagDoc> {
    return inversify.mongo.collection<TagDoc>('tags');
  }

  // Ensure indexes
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<TagDoc>('tags') : this.col();
      await collection.createIndexes([
        // Unique per user to allow same tag name across users
        { key: { slug: 1, locale: 1, createdBy: 1 }, name: 'uniq_slug_locale_owner', unique: true },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
        // Helpful filters
        { key: { createdBy: 1 }, name: 'by_createdBy' },
        { key: { visibility: 1 }, name: 'by_visibility' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  // Create
  async create(dto: CreateTagDto): Promise<Tag | null> {
    const now = new Date();
    const doc: Omit<TagDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      visibility: normalizeVisibility(dto.visibility) ?? 'PRIVATE',
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (this.col()).insertOne(doc as TagDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null; // duplicate for same owner+locale
      this.handleError('create', error);
    }
  }

  // Read one
  async get(dto: GetTagDto): Promise<Tag | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  // List with filters/pagination
  async listTags(params: ListTagsDto = {}) {
    const {
      q, locale, createdBy, visibility, limit = 20, page = 1, sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, unknown> = {};
    if (q?.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ slug: { $regex: regex } }, { label: { $regex: regex } }];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;
    if (visibility) {
      const normalized = normalizeVisibility(visibility);
      if (normalized) filter.visibility = normalized;
    }

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('listTags', error);
    }
  }

  // Update (partial)
  async update(id: string, patch: UpdateTagDto): Promise<Tag | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<TagDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.visibility !== undefined) $set.visibility = normalizeVisibility(patch.visibility) ?? 'PRIVATE';

    try {
      const res: any = await (this.col()).findOneAndUpdate(
        { _id }, { $set }, { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null; // hit unique (slug, locale, createdBy)
      this.handleError('update', error);
    }
  }

  // Delete
  /**
   * Soft delete: marks tag as deleted by setting deletedAt timestamp.
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

  // Utils
  private toObjectId(id: string): ObjectId {
    try { return new ObjectId(id); }
    catch { throw new Error('InvalidObjectId'); }
  }

  private toModel = (doc: TagDoc): Tag => ({
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
    inversify.loggerService.error(`BddServiceTagMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}


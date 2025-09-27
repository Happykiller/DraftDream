// src/services/db/mongo/tag.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';
import inversify from '@src/inversify/investify';
import { Tag } from '@services/db/models/tag.model';
import {
  CreateTagDto, GetTagDto, ListTagsDto, UpdateTagDto,
} from '@services/db/dtos/tag.dto';

type TagDoc = {
  _id: ObjectId;
  slug: string;
  locale: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class BddServiceTagMongo {
  // Get collection handle
  private async col(): Promise<Collection<TagDoc>> {
    return inversify.mongo.collection<TagDoc>('tags');
  }

  // Ensure indexes
  async ensureIndexes(db?: Db): Promise<void> {
    const collection = db ? db.collection<TagDoc>('tags') : await this.col();
    await collection.createIndexes([
      // Unique per user to allow same tag name across users
      { key: { slug: 1, locale: 1, createdBy: 1 }, name: 'uniq_slug_locale_owner', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      // Helpful filters
      { key: { createdBy: 1 }, name: 'by_createdBy' },
      { key: { visibility: 1 }, name: 'by_visibility' },
    ]);
  }

  // Create
  async create(dto: CreateTagDto): Promise<Tag | null> {
    const now = new Date();
    const doc: Omit<TagDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as TagDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (e: any) {
      if (e?.code === 11000) return null; // duplicate for same owner+locale
      throw e;
    }
  }

  // Read one
  async get(dto: GetTagDto): Promise<Tag | null> {
    try {
      const _id = new ObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch {
      return null;
    }
  }

  // List with filters/pagination
  async listTags(params: ListTagsDto = {}) {
    const {
      q, locale, createdBy, visibility, limit = 20, page = 1, sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, unknown> = {};
    if (q && q.trim()) filter.slug = { $regex: new RegExp(q.trim(), 'i') };
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;
    if (visibility === 'public' || visibility === 'private') filter.visibility = visibility;

    const collection = await this.col();
    const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

    return { items: rows.map(this.toModel), total, page, limit };
  }

  // Update (partial)
  async update(id: string, patch: UpdateTagDto): Promise<Tag | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<TagDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.visibility !== undefined) $set.visibility = patch.visibility;

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id }, { $set }, { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (e: any) {
      if (e?.code === 11000) return null; // hit unique (slug, locale, createdBy)
      throw e;
    }
  }

  // Delete
  async delete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const res = await (await this.col()).deleteOne({ _id });
    return res.deletedCount === 1;
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
    visibility: doc.visibility,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

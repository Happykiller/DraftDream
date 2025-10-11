// src\services\db\mongo\category.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';
import inversify from '@src/inversify/investify';
import { Category } from '@services/db/models/category.model';
import {
  CreateCategoryDto, GetCategoryDto, ListCategoriesDto, UpdateCategoryDto,
} from '@services/db/dtos/category.dto';

type CategoryDoc = {
  _id: ObjectId;
  slug: string;
  locale: string;
  name: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export class BddServiceCategoryMongo {
  private async col(): Promise<Collection<CategoryDoc>> {
    return inversify.mongo.collection<CategoryDoc>('categories');
  }

  async ensureIndexes(db?: Db): Promise<void> {
    const collection = db ? db.collection<CategoryDoc>('categories') : await this.col();
    await collection.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
    ]);
  }

  async create(dto: CreateCategoryDto): Promise<Category | null> {
    const now = new Date();
    const doc: Omit<CategoryDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      name: dto.name.trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as CategoryDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (e: any) {
      if (e?.code === 11000) return null;
      throw e;
    }
  }

  async get(dto: GetCategoryDto): Promise<Category | null> {
    try {
      const _id = new ObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch {
      return null;
    }
  }

  async list(params: ListCategoriesDto = {}) {
    const {
      q, locale, createdBy, visibility, limit = 20, page = 1, sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ slug: { $regex: regex } }, { name: { $regex: regex } }];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;
    if (visibility === 'public' || visibility === 'private') {
      filter.visibility = visibility;
    }

    const collection = await this.col();
    const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

    return { items: rows.map(this.toModel), total, page, limit };
  }

  async update(id: string, patch: UpdateCategoryDto): Promise<Category | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<CategoryDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.name !== undefined) $set.name = patch.name.trim();

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id }, { $set }, { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (e: any) {
      if (e?.code === 11000) return null;
      throw e;
    }
  }

  async delete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const res = await (await this.col()).deleteOne({ _id });
    return res.deletedCount === 1;
  }

  private toObjectId(id: string): ObjectId {
    try { return new ObjectId(id); }
    catch { throw new Error('InvalidObjectId'); }
  }

  private toModel = (doc: CategoryDoc): Category => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    name: doc.name,
    visibility: doc.visibility,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

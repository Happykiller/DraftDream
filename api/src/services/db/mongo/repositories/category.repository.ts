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
  label: string;
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
    try {
      const collection = db ? db.collection<CategoryDoc>('categories') : await this.col();
      await collection.createIndexes([
        { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  async create(dto: CreateCategoryDto): Promise<Category | null> {
    const now = new Date();
    const doc: Omit<CategoryDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as CategoryDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  async get(dto: GetCategoryDto): Promise<Category | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  async list(params: ListCategoriesDto = {}) {
    const {
      q, locale, createdBy, visibility, limit = 20, page = 1, sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ slug: { $regex: regex } }, { label: { $regex: regex } }];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;
    if (visibility === 'public' || visibility === 'private') {
      filter.visibility = visibility;
    }

    try {
      const collection = await this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  async update(id: string, patch: UpdateCategoryDto): Promise<Category | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<CategoryDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id }, { $set }, { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await (await this.col()).deleteOne({ _id });
      return res.deletedCount === 1;
    } catch (error) {
      this.handleError('delete', error);
    }
  }

  private toObjectId(id: string): ObjectId {
    try { return new ObjectId(id); }
    catch { throw new Error('InvalidObjectId'); }
  }

  private toModel = (doc: CategoryDoc): Category => ({
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
    inversify.loggerService.error(`BddServiceCategoryMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

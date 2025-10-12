// src\services\db\mongo\equipment.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';
import inversify from '@src/inversify/investify';
import { Equipment } from '@services/db/models/equipment.model';
import {
  CreateEquipmentDto, GetEquipmentDto, ListEquipmentDto, UpdateEquipmentDto,
} from '@services/db/dtos/equipment.dto';

type EquipmentDoc = {
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

export class BddServiceEquipmentMongo {
  // Get collection
  private async col(): Promise<Collection<EquipmentDoc>> {
    return inversify.mongo.collection<EquipmentDoc>('equipments');
  }

  // Ensure indexes
  async ensureIndexes(db?: Db): Promise<void> {
    const collection = db ? db.collection<EquipmentDoc>('equipments') : await this.col();
    await collection.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
    ]);
  }

  // Create
  async create(dto: CreateEquipmentDto): Promise<Equipment | null> {
    const now = new Date();
    const doc: Omit<EquipmentDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await (await this.col()).insertOne(doc as EquipmentDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (e: any) {
      if (e?.code === 11000) return null; // duplicate slug+locale
      throw e;
    }
  }

  // Read one
  async get(dto: GetEquipmentDto): Promise<Equipment | null> {
    try {
      const _id = new ObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch {
      return null;
    }
  }

  // List
  async listEquipments(params: ListEquipmentDto = {}) {
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

    const collection = await this.col();
    const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
    const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

    return { items: rows.map(this.toModel), total, page, limit };
  }

  // Update
  async update(id: string, patch: UpdateEquipmentDto): Promise<Equipment | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<EquipmentDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();

    try {
      const res: any = await (await this.col()).findOneAndUpdate(
        { _id }, { $set }, { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (e: any) {
      if (e?.code === 11000) return null; // unique constraint
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

  private toModel = (doc: EquipmentDoc): Equipment => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    label: doc.label,
    visibility: doc.visibility,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

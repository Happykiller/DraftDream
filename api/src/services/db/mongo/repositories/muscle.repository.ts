// src/services/db/mongo/muscle.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';

import inversify from '@src/inversify/investify';
import { Muscle } from '@services/db/models/muscle.model';
import { CreateMuscleDto, GetMuscleDto, ListMusclesDto, UpdateMuscleDto } from '@services/db/dtos/muscle.dto';

type MuscleDoc = {
  _id: ObjectId;
  slug: string;
  locale: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class BddServiceMuscleMongo {
  // --- Collection access ---
  private async col(): Promise<Collection<MuscleDoc>> {
    return inversify.mongo.collection<MuscleDoc>('muscles');
  }

  // --- Optional: call this once at startup OR ship as a migration ---
  async ensureIndexes(db?: Db): Promise<void> {
    const collection = db ? db.collection<MuscleDoc>('muscles') : await this.col();
    await collection.createIndexes([
      { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
      { key: { updatedAt: -1 }, name: 'by_updatedAt' },
    ]);
  }

  // --- Create ---
  async createMuscle(dto: CreateMuscleDto): Promise<Muscle | null> {
    const now = new Date();
    const doc: Omit<MuscleDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await (await this.col()).insertOne(doc as MuscleDoc);
      return {
        id: result.insertedId.toHexString(),
        ...doc,
      };
    } catch (e: any) {
      if (e?.code === 11000) {
        // duplicate (slug, locale)
        return null;
      }
      throw e;
    }
  }

  // --- Read one by id ---
  async getMuscle(dto: GetMuscleDto): Promise<Muscle | null> {
    try {
      const _id = new ObjectId(dto.id);
      const doc = await (await this.col()).findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch {
      return null; // invalid ObjectId
    }
  }

  // --- List with filters/pagination ---
  async listMuscles(params: ListMusclesDto = {}): Promise<{ items: Muscle[]; total: number; page: number; limit: number }> {
    const {
      q,
      locale,
      createdBy,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: any = {};
    if (q && q.trim()) {
      filter.slug = { $regex: new RegExp(q.trim(), 'i') };
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;

    const collection = await this.col();
    const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);

    const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);
    return {
      items: rows.map(this.toModel),
      total,
      page,
      limit,
    };
  }

  // --- Update (partial) ---
  async updateMuscle(id: string, patch: UpdateMuscleDto): Promise<Muscle | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<MuscleDoc> = { updatedAt: new Date() };

    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();

    try {
      const res:any = await (await this.col()).findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (e: any) {
      if (e?.code === 11000) {
        // violating (slug, locale) unique
        return null;
      }
      throw e;
    }
  }

  // --- Delete (hard delete) ---
  async deleteMuscle(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const res = await (await this.col()).deleteOne({ _id });
    return res.deletedCount === 1;
  }

  // --- Utils ---
  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      // surface invalid id as null result in caller
      throw new Error('InvalidObjectId');
    }
  }

  private toModel = (doc: MuscleDoc): Muscle => ({
    id: doc._id.toHexString(),
    slug: doc.slug,
    locale: doc.locale,
    visibility: doc.visibility,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
}

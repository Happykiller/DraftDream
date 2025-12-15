// src/services/db/mongo/repositories/prospect/activity-preference.repository.ts
import {
  Collection,
  Db,
  ObjectId,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { ProspectActivityPreference } from '@services/db/models/prospect/activity-preference.model';
import {
  CreateProspectActivityPreferenceDto,
  GetProspectActivityPreferenceDto,
  ListProspectActivityPreferencesDto,
  UpdateProspectActivityPreferenceDto,
} from '@services/db/dtos/prospect/activity-preference.dto';

interface ProspectActivityPreferenceDoc {
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

export class BddServiceProspectActivityPreferenceMongo {
  // Retrieve the Mongo collection handle for prospect activity preferences
  private col(): Collection<ProspectActivityPreferenceDoc> {
    return inversify.mongo.collection<ProspectActivityPreferenceDoc>('prospect_activity_preferences');
  }

  // Ensure indexes for fast lookups and uniqueness
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<ProspectActivityPreferenceDoc>('prospect_activity_preferences') : this.col();
      await collection.createIndexes([
        { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  // Create a new prospect activity preference document
  async create(dto: CreateProspectActivityPreferenceDto): Promise<ProspectActivityPreference | null> {
    const now = new Date();
    const doc: Omit<ProspectActivityPreferenceDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await this.col().insertOne(doc as ProspectActivityPreferenceDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  // Retrieve a prospect activity preference by identifier
  async get(dto: GetProspectActivityPreferenceDto): Promise<ProspectActivityPreference | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  // List prospect activity preferences with optional filters
  async list(params: ListProspectActivityPreferencesDto = {}) {
    const {
      q, locale, createdBy, visibility, limit = 20, page = 1, sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q?.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ slug: { $regex: regex } }, { label: { $regex: regex } }];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;
    if (visibility === 'PUBLIC' || visibility === 'PRIVATE') {
      filter.visibility = visibility;
    }

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  // Update an existing prospect activity preference document
  async update(id: string, patch: UpdateProspectActivityPreferenceDto): Promise<ProspectActivityPreference | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ProspectActivityPreferenceDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.visibility !== undefined) $set.visibility = patch.visibility;

    try {
      const updatedDoc = await this.col().findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' },
      );
      if (!updatedDoc) {
        return null;
      }
      return this.toModel(updatedDoc);
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  // Delete a prospect activity preference document
  /**
   * Soft delete: marks prospect activity preference as deleted by setting deletedAt timestamp.
   * Preserves data for audit trail and potential recovery.
   */
  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const now = new Date();
      const res = await this.col().updateOne(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: now, updatedAt: now } }
      );
      return res.modifiedCount === 1;
    } catch (error) {
      this.handleError('delete', error);
    }
  }

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  }

  private toModel = (doc: ProspectActivityPreferenceDoc): ProspectActivityPreference => ({
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
    inversify.loggerService.error(`BddServiceProspectActivityPreferenceMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

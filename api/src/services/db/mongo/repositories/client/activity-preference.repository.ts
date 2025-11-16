// src/services/db/mongo/repositories/client/activity-preference.repository.ts
import {
  Collection,
  Db,
  ObjectId,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { ClientActivityPreference } from '@services/db/models/client/activity-preference.model';
import {
  CreateClientActivityPreferenceDto,
  GetClientActivityPreferenceDto,
  ListClientActivityPreferencesDto,
  UpdateClientActivityPreferenceDto,
} from '@services/db/dtos/client/activity-preference.dto';

interface ClientActivityPreferenceDoc {
  _id: ObjectId;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class BddServiceClientActivityPreferenceMongo {
  // Retrieve the Mongo collection handle for client activity preferences
  private col(): Collection<ClientActivityPreferenceDoc> {
    return inversify.mongo.collection<ClientActivityPreferenceDoc>('client_activity_preferences');
  }

  // Ensure indexes for fast lookups and uniqueness
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db
        ? db.collection<ClientActivityPreferenceDoc>('client_activity_preferences')
        : this.col();
      await collection.createIndexes([
        { key: { slug: 1, locale: 1 }, name: 'client_activity_preferences_slug_locale', unique: true },
        { key: { updatedAt: -1 }, name: 'client_activity_preferences_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  // Create a new client activity preference document
  async create(dto: CreateClientActivityPreferenceDto): Promise<ClientActivityPreference | null> {
    const now = new Date();
    const doc: Omit<ClientActivityPreferenceDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await this.col().insertOne(doc as ClientActivityPreferenceDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  // Retrieve a client activity preference by identifier
  async get(dto: GetClientActivityPreferenceDto): Promise<ClientActivityPreference | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  // List client activity preferences with optional filters
  async list(params: ListClientActivityPreferencesDto = {}) {
    const {
      q,
      locale,
      createdBy,
      visibility,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q?.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [{ slug: { $regex: regex } }, { label: { $regex: regex } }];
    }
    if (locale) filter.locale = locale.toLowerCase().trim();
    if (createdBy) filter.createdBy = createdBy;
    if (visibility === 'public' || visibility === 'private') {
      filter.visibility = visibility;
    }

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([
        cursor.toArray(),
        collection.countDocuments(filter),
      ]);

      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  // Update an existing client activity preference document
  async update(id: string, patch: UpdateClientActivityPreferenceDto): Promise<ClientActivityPreference | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ClientActivityPreferenceDoc> = { updatedAt: new Date() };
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

  // Delete a client activity preference document
  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await this.col().deleteOne({ _id });
      return res.deletedCount === 1;
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

  private toModel = (doc: ClientActivityPreferenceDoc): ClientActivityPreference => ({
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
    inversify.loggerService.error(`BddServiceClientActivityPreferenceMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

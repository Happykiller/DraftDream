// src/services/db/mongo/repositories/client/objective.repository.ts
import { Collection, ObjectId, Db } from 'mongodb';

import inversify from '@src/inversify/investify';

import { ClientObjective } from '@services/db/models/client/objective.model';
import {
  CreateClientObjectiveDto,
  GetClientObjectiveDto,
  ListClientObjectivesDto,
  UpdateClientObjectiveDto,
} from '@services/db/dtos/client/objective.dto';

interface ClientObjectiveDoc {
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

export class BddServiceClientObjectiveMongo {
  // Retrieve the Mongo collection handle for client objectives
  private col(): Collection<ClientObjectiveDoc> {
    return inversify.mongo.collection<ClientObjectiveDoc>('client_objectives');
  }

  // Ensure indexes for fast lookups and uniqueness
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<ClientObjectiveDoc>('client_objectives') : this.col();
      await collection.createIndexes([
        { key: { slug: 1, locale: 1 }, name: 'uniq_slug_locale', unique: true },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  // Create a new client objective document
  async create(dto: CreateClientObjectiveDto): Promise<ClientObjective | null> {
    const now = new Date();
    const doc: Omit<ClientObjectiveDoc, '_id'> = {
      slug: dto.slug.toLowerCase().trim(),
      locale: dto.locale.toLowerCase().trim(),
      label: dto.label.trim(),
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await this.col().insertOne(doc as ClientObjectiveDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  // Retrieve a client objective by identifier
  async get(dto: GetClientObjectiveDto): Promise<ClientObjective | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  // List client objectives with optional filters
  async list(params: ListClientObjectivesDto = {}) {
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
    if (visibility === 'public' || visibility === 'private') {
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

  // Update an existing client objective document
  async update(id: string, patch: UpdateClientObjectiveDto): Promise<ClientObjective | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ClientObjectiveDoc> = { updatedAt: new Date() };
    if (patch.slug !== undefined) $set.slug = patch.slug.toLowerCase().trim();
    if (patch.locale !== undefined) $set.locale = patch.locale.toLowerCase().trim();
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.visibility !== undefined) $set.visibility = patch.visibility;

    try {
      const res = await this.col().findOneAndUpdate(
        { _id },
        { $set },
        { returnDocument: 'after' },
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  // Delete a client objective document
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

  private toModel = (doc: ClientObjectiveDoc): ClientObjective => ({
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
    inversify.loggerService.error(`BddServiceClientObjectiveMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

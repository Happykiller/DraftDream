// src/services/db/mongo/repositories/client/client.repository.ts
import {
  Collection,
  Db,
  ObjectId,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { Client } from '@services/db/models/client/client.model';
import {
  CreateClientDto,
  GetClientDto,
  ListClientsDto,
  UpdateClientDto,
} from '@services/db/dtos/client/client.dto';

interface ClientDoc {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  statusId?: string;
  levelId?: string;
  objectiveIds: string[];
  activityPreferenceIds: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  sourceId?: string;
  budget?: number;
  dealDescription?: string;
  desiredStartDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class BddServiceClientMongo {
  private col(): Collection<ClientDoc> {
    return inversify.mongo.collection<ClientDoc>('clients');
  }

  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<ClientDoc>('clients') : this.col();
      await collection.createIndexes([
        { key: { email: 1 }, name: 'clients_email_unique', unique: true },
        { key: { statusId: 1 }, name: 'clients_statusId' },
        { key: { levelId: 1 }, name: 'clients_levelId' },
        { key: { sourceId: 1 }, name: 'clients_sourceId' },
        { key: { updatedAt: -1 }, name: 'clients_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  async create(dto: CreateClientDto): Promise<Client | null> {
    const now = new Date();
    const doc: Omit<ClientDoc, '_id'> = {
      firstName: this.normalizeName(dto.firstName),
      lastName: this.normalizeName(dto.lastName),
      email: this.normalizeEmail(dto.email),
      phone: this.normalizeOptional(dto.phone),
      statusId: this.normalizeOptional(dto.statusId),
      levelId: this.normalizeOptional(dto.levelId),
      objectiveIds: this.normalizeIds(dto.objectiveIds) ?? [],
      activityPreferenceIds: this.normalizeIds(dto.activityPreferenceIds) ?? [],
      medicalConditions: this.normalizeOptional(dto.medicalConditions),
      allergies: this.normalizeOptional(dto.allergies),
      notes: this.normalizeOptional(dto.notes),
      sourceId: this.normalizeOptional(dto.sourceId),
      budget: this.normalizeBudget(dto.budget),
      dealDescription: this.normalizeOptional(dto.dealDescription),
      desiredStartDate: this.normalizeDate(dto.desiredStartDate),
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await this.col().insertOne(doc as ClientDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  async get(dto: GetClientDto): Promise<Client | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  async list(params: ListClientsDto = {}) {
    const {
      q,
      statusId,
      levelId,
      sourceId,
      createdBy,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = {};
    if (q?.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
      ];
    }
    if (statusId) filter.statusId = statusId;
    if (levelId) filter.levelId = levelId;
    if (sourceId) filter.sourceId = sourceId;
    if (createdBy) filter.createdBy = createdBy;

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

  async update(id: string, patch: UpdateClientDto): Promise<Client | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ClientDoc> = { updatedAt: new Date() };
    if (patch.firstName !== undefined) $set.firstName = this.normalizeName(patch.firstName);
    if (patch.lastName !== undefined) $set.lastName = this.normalizeName(patch.lastName);
    if (patch.email !== undefined) $set.email = this.normalizeEmail(patch.email);
    if (patch.phone !== undefined) $set.phone = this.normalizeOptional(patch.phone);
    if (patch.statusId !== undefined) $set.statusId = this.normalizeOptional(patch.statusId);
    if (patch.levelId !== undefined) $set.levelId = this.normalizeOptional(patch.levelId);
    if (patch.objectiveIds !== undefined) {
      $set.objectiveIds = this.normalizeIds(patch.objectiveIds) ?? [];
    }
    if (patch.activityPreferenceIds !== undefined) {
      $set.activityPreferenceIds = this.normalizeIds(patch.activityPreferenceIds) ?? [];
    }
    if (patch.medicalConditions !== undefined) {
      $set.medicalConditions = this.normalizeOptional(patch.medicalConditions);
    }
    if (patch.allergies !== undefined) {
      $set.allergies = this.normalizeOptional(patch.allergies);
    }
    if (patch.notes !== undefined) {
      $set.notes = this.normalizeOptional(patch.notes);
    }
    if (patch.sourceId !== undefined) $set.sourceId = this.normalizeOptional(patch.sourceId);
    if (patch.budget !== undefined) $set.budget = this.normalizeBudget(patch.budget);
    if (patch.dealDescription !== undefined) {
      $set.dealDescription = this.normalizeOptional(patch.dealDescription);
    }
    if (patch.desiredStartDate !== undefined) {
      $set.desiredStartDate = this.normalizeDate(patch.desiredStartDate);
    }

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

  async delete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await this.col().deleteOne({ _id });
      return res.deletedCount === 1;
    } catch (error) {
      this.handleError('delete', error);
    }
  }

  private normalizeName(value: string): string {
    return value?.trim() ?? '';
  }

  private normalizeOptional(value?: string | null): string | undefined {
    if (value === undefined || value === null) return undefined;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }

  private normalizeEmail(value: string): string {
    return value?.trim().toLowerCase();
  }

  private normalizeIds(values?: string[] | null): string[] | undefined {
    if (!Array.isArray(values)) return undefined;
    const cleaned = values
      .map((val) => val?.trim())
      .filter((val): val is string => Boolean(val));
    if (!cleaned.length) return [];
    return Array.from(new Set(cleaned));
  }

  private normalizeBudget(value?: number | null): number | undefined {
    if (value === undefined || value === null) return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private normalizeDate(value?: Date | string | null): Date | undefined {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  private toObjectId(id: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch {
      throw new Error('InvalidObjectId');
    }
  }

  private toModel = (doc: ClientDoc): Client => ({
    id: doc._id.toHexString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    statusId: doc.statusId,
    levelId: doc.levelId,
    objectiveIds: doc.objectiveIds ?? [],
    activityPreferenceIds: doc.activityPreferenceIds ?? [],
    medicalConditions: doc.medicalConditions,
    allergies: doc.allergies,
    notes: doc.notes,
    sourceId: doc.sourceId,
    budget: doc.budget,
    dealDescription: doc.dealDescription,
    desiredStartDate: doc.desiredStartDate,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  });

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceClientMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

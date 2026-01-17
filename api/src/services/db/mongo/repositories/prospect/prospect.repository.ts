// src/services/db/mongo/repositories/client/client.repository.ts
import {
  Collection,
  Db,
  ObjectId,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { Prospect, ProspectWorkflowEntry } from '@services/db/models/prospect/prospect.model';
import {
  CreateProspectDto,
  GetProspectDto,
  ListProspectsDto,
  UpdateProspectDto,
} from '@services/db/dtos/prospect/prospect.dto';

import { toProspectStatus } from '@src/common/enum.util';
import { ProspectStatus } from '@src/common/prospect-status.enum';

interface ProspectDoc {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ProspectStatus;
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
  workflowHistory: ProspectWorkflowEntry[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class BddServiceProspectMongo {
  private col(): Collection<ProspectDoc> {
    return inversify.mongo.collection<ProspectDoc>('prospects');
  }

  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<ProspectDoc>('prospects') : this.col();
      await collection.createIndexes([
        { key: { email: 1 }, name: 'prospects_email_unique', unique: true },
        { key: { status: 1 }, name: 'prospects_status' },
        { key: { levelId: 1 }, name: 'prospects_levelId' },
        { key: { sourceId: 1 }, name: 'prospects_sourceId' },
        { key: { updatedAt: -1 }, name: 'prospects_updatedAt' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  async create(dto: CreateProspectDto): Promise<Prospect | null> {
    const now = new Date();
    const workflowHistory = this.normalizeWorkflowHistory(dto.workflowHistory, now);
    const doc: Omit<ProspectDoc, '_id'> = {
      firstName: this.normalizeName(dto.firstName),
      lastName: this.normalizeName(dto.lastName),
      email: this.normalizeEmail(dto.email),
      phone: this.normalizeOptional(dto.phone),
      status: this.toStatus(dto.status),
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
      workflowHistory: workflowHistory?.length ? workflowHistory : [{ status: 'create', date: now }],
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await this.col().insertOne(doc as ProspectDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  async get(dto: GetProspectDto): Promise<Prospect | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id, deletedAt: { $exists: false } });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  async list(params: ListProspectsDto = {}) {
    const {
      q,
      status,
      levelId,
      sourceId,
      createdBy,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, any> = { deletedAt: { $exists: false } };
    if (q?.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { firstName: { $regex: regex } },
        { lastName: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
      ];
    }
    if (status) {
      const normalizedStatus = this.toStatus(status);
      if (normalizedStatus) filter.status = normalizedStatus;
    }
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

  async update(id: string, patch: UpdateProspectDto): Promise<Prospect | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ProspectDoc> = { updatedAt: new Date() };
    if (patch.firstName !== undefined) $set.firstName = this.normalizeName(patch.firstName);
    if (patch.lastName !== undefined) $set.lastName = this.normalizeName(patch.lastName);
    if (patch.email !== undefined) $set.email = this.normalizeEmail(patch.email);
    if (patch.phone !== undefined) $set.phone = this.normalizeOptional(patch.phone);
    if (patch.status !== undefined) $set.status = this.toStatus(patch.status);
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
    if (patch.workflowHistory !== undefined) {
      $set.workflowHistory = this.normalizeWorkflowHistory(patch.workflowHistory) ?? [];
    }

    try {
      const updatedDoc = await this.col().findOneAndUpdate(
        { _id, deletedAt: { $exists: false } },
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

  /**
   * Soft delete: marks prospect as deleted by setting deletedAt timestamp.
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

  /**
   * Hard delete: permanently removes prospect from database.
   * This operation is irreversible.
   */
  async hardDelete(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await this.col().deleteOne({ _id });
      return res.deletedCount === 1;
    } catch (error) {
      this.handleError('hardDelete', error);
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

  private toModel = (doc: ProspectDoc): Prospect => ({
    id: doc._id.toHexString(),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    status: this.toStatus(doc.status),
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
    workflowHistory: this.normalizeWorkflowHistory(doc.workflowHistory) ?? [],
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  });

  private normalizeWorkflowHistory(
    entries?: ProspectWorkflowEntry[] | null,
    fallbackDate?: Date,
  ): ProspectWorkflowEntry[] | undefined {
    if (entries === undefined) return undefined;
    if (!entries) return [];

    return entries
      .map((entry) => {
        const normalizedStatus =
          entry.status === 'create' ? 'create' : this.toStatus(entry.status);
        const date = this.normalizeDate(entry.date) ?? fallbackDate;
        if (!normalizedStatus || !date) return null;
        return { status: normalizedStatus, date };
      })
      .filter((entry): entry is ProspectWorkflowEntry => Boolean(entry));
  }

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceProspectMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }

  /**
   * Returns a clean prospect status enum value when provided.
   */
  private toStatus(value?: ProspectStatus | string | null): ProspectStatus | undefined {
    return toProspectStatus(value ?? undefined);
  }
}

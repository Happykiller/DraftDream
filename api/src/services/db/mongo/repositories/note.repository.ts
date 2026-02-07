// src/services/db/mongo/note.repository.ts
import { Collection, Db, ObjectId } from 'mongodb';

import inversify from '@src/inversify/investify';
import { Note } from '@services/db/models/note.model';
import {
  CreateNoteDto,
  GetNoteDto,
  ListNotesDto,
  UpdateNoteDto,
} from '@services/db/dtos/note.dto';

interface NoteDoc {
  _id: ObjectId;
  label: string;
  description: string;
  athleteId?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * Mongo repository for Note persistence.
 */
export class BddServiceNoteMongo {
  private col(): Collection<NoteDoc> {
    return inversify.mongo.collection<NoteDoc>('notes');
  }

  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<NoteDoc>('notes') : this.col();
      await collection.createIndexes([
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
        { key: { createdBy: 1 }, name: 'by_createdBy' },
        { key: { athleteId: 1 }, name: 'by_athleteId' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  async create(dto: CreateNoteDto): Promise<Note | null> {
    const now = new Date();
    const athleteId = dto.athleteId ? dto.athleteId.trim() : dto.athleteId ?? undefined;
    const doc: Omit<NoteDoc, '_id'> = {
      label: dto.label.trim(),
      description: dto.description.trim(),
      athleteId,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await this.col().insertOne(doc as NoteDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      this.handleError('create', error);
    }
  }

  async get(dto: GetNoteDto): Promise<Note | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  async listNotes(params: ListNotesDto = {}) {
    const {
      athleteId,
      createdBy,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (createdBy) filter.createdBy = createdBy;
    if (athleteId !== undefined) {
      filter.athleteId = typeof athleteId === 'string' ? athleteId.trim() : athleteId;
    }

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);
      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('listNotes', error);
    }
  }

  async update(id: string, patch: UpdateNoteDto): Promise<Note | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<NoteDoc> = { updatedAt: new Date() };
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.description !== undefined) $set.description = patch.description.trim();
    if (patch.athleteId !== undefined) {
      $set.athleteId = patch.athleteId ? patch.athleteId.trim() : patch.athleteId;
    }

    try {
      const res: any = await this.col().findOneAndUpdate(
        { _id }, { $set }, { returnDocument: 'after' }
      );
      return res.value ? this.toModel(res.value) : null;
    } catch (error) {
      this.handleError('update', error);
    }
  }

  /**
   * Soft delete: marks note as deleted by setting deletedAt timestamp.
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
   * Hard delete: permanently removes note from database.
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

  private toObjectId(id: string): ObjectId {
    try { return new ObjectId(id); }
    catch { throw new Error('InvalidObjectId'); }
  }

  private toModel = (doc: NoteDoc): Note => ({
    id: doc._id.toHexString(),
    label: doc.label,
    description: doc.description,
    athleteId: doc.athleteId ?? null,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  });

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceNoteMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

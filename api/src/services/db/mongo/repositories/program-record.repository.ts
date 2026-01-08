// src/services/db/mongo/repositories/program-record.repository.ts
import {
  Collection,
  Db,
  DeleteResult,
  Filter,
  ObjectId,
  Sort,
} from 'mongodb';

import inversify from '@src/inversify/investify';

import { ProgramRecordState } from '@src/common/program-record-state.enum';
import {
  ProgramRecord,
  ProgramRecordData,
} from '@services/db/models/program-record.model';
import type { ProgramSessionSnapshot } from '@services/db/models/program.model';
import {
  CreateProgramRecordDto,
  GetProgramRecordDto,
  ListProgramRecordsDto,
  UpdateProgramRecordDto,
} from '@services/db/dtos/program-record.dto';

interface ProgramRecordDoc {
  _id: ObjectId;
  userId: string;
  programId: string;
  sessionId: string;
  sessionSnapshot?: ProgramSessionSnapshot;
  recordData?: ProgramRecordData;
  comment?: string;
  satisfactionRating?: number;
  durationMinutes?: number;
  difficultyRating?: number;
  state: ProgramRecordState;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  schemaVersion: number;
}


/**
 * MongoDB repository for tracking athlete program execution records.
 */
export class BddServiceProgramRecordMongo {
  private col(): Collection<ProgramRecordDoc> {
    return inversify.mongo.collection<ProgramRecordDoc>('program_records');
  }

  /**
   * Ensures indexes exist for program record documents.
   */
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<ProgramRecordDoc>('program_records') : this.col();
      // Drop the old unique index to allow multiple records for the same session
      try {
        await collection.dropIndex('program_records_user_program_session_unique');
      } catch {
        // Ignore error if index does not exist
      }

      await collection.createIndexes([
        { key: { userId: 1 }, name: 'program_records_userId' },
        { key: { programId: 1 }, name: 'program_records_programId' },
        { key: { sessionId: 1 }, name: 'program_records_sessionId' },
        { key: { state: 1 }, name: 'program_records_state' },
        { key: { updatedAt: -1 }, name: 'program_records_updatedAt' },
      ]);

    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  /**
   * Persists a new program record.
   */
  async create(dto: CreateProgramRecordDto): Promise<ProgramRecord | null> {
    const userId = this.normalizeId(dto.userId);
    const programId = this.normalizeId(dto.programId);
    const sessionId = this.normalizeId(dto.sessionId);
    const createdBy = this.normalizeId(dto.createdBy);
    if (!userId || !programId || !sessionId || !createdBy) {
      throw new Error('INVALID_PROGRAM_RECORD_REFERENCE');
    }

    const now = new Date();
    const doc: Omit<ProgramRecordDoc, '_id'> = {
      userId,
      programId,
      sessionId,
      sessionSnapshot: dto.sessionSnapshot,
      recordData: dto.recordData,
      comment: dto.comment,
      satisfactionRating: dto.satisfactionRating,
      durationMinutes: dto.durationMinutes,
      difficultyRating: dto.difficultyRating,
      state: dto.state,
      createdBy,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 4,
    };


    try {
      const res = await this.col().insertOne(doc as ProgramRecordDoc);
      return this.toModel({ _id: res.insertedId, ...doc } as ProgramRecordDoc);
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('create', error);
    }
  }

  /**
   * Retrieves a program record by its identifier.
   */
  async get(dto: GetProgramRecordDto): Promise<ProgramRecord | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id, deletedAt: { $exists: false } });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  /**
   * Retrieves a program record for a given user and program pair.
   */
  async getByUserProgram(params: { userId: string; programId: string; sessionId: string }): Promise<ProgramRecord | null> {
    try {
      const userId = this.normalizeId(params.userId);
      const programId = this.normalizeId(params.programId);
      const sessionId = this.normalizeId(params.sessionId);
      if (!userId || !programId || !sessionId) {
        throw new Error('INVALID_PROGRAM_RECORD_REFERENCE');
      }
      const doc = await this.col().findOne({
        userId,
        programId,
        sessionId,
        deletedAt: { $exists: false },
      });

      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('getByUserProgram', error);
    }
  }

  /**
   * Lists program records matching provided filters.
   */
  async list(params: ListProgramRecordsDto = {}) {
    const {
      userId,
      programId,
      sessionId,
      state,
      createdBy,
      includeArchived = false,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 } as Record<string, 1 | -1>,
    } = params;

    const filter: Filter<ProgramRecordDoc> = {};
    if (userId?.trim()) filter.userId = userId.trim();
    if (programId?.trim()) filter.programId = programId.trim();
    if (sessionId?.trim()) filter.sessionId = sessionId.trim();
    if (state) filter.state = state;
    if (createdBy?.trim()) filter.createdBy = createdBy.trim();
    if (!includeArchived) filter.deletedAt = { $exists: false } as any;

    try {
      const collection = this.col();
      const cursor = collection
        .find(filter)
        .sort(sort as Sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const [rows, total] = await Promise.all([
        cursor.toArray(),
        collection.countDocuments(filter),
      ]);

      return {
        items: rows.map((doc) => this.toModel(doc)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.handleError('list', error);
    }
  }

  /**
   * Updates the record state for the given identifier.
   */
  async update(id: string, patch: UpdateProgramRecordDto): Promise<ProgramRecord | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<ProgramRecordDoc> = { updatedAt: new Date() };

    if (patch.state !== undefined) {
      $set.state = patch.state;
    }
    if (patch.recordData !== undefined) {
      $set.recordData = patch.recordData;
    }
    if (patch.comment !== undefined) {
      $set.comment = patch.comment;
    }
    if (patch.satisfactionRating !== undefined) {
      $set.satisfactionRating = patch.satisfactionRating;
    }
    if (patch.durationMinutes !== undefined) {
      $set.durationMinutes = patch.durationMinutes;
    }
    if (patch.difficultyRating !== undefined) {
      $set.difficultyRating = patch.difficultyRating;
    }

    try {
      const updated = await this.col().findOneAndUpdate(
        { _id, deletedAt: { $exists: false } },
        { $set },
        { returnDocument: 'after' },
      );
      return updated ? this.toModel(updated) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) return null;
      this.handleError('update', error);
    }
  }

  /**
   * Soft deletes a program record by setting deletedAt.
   */
  async softDelete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    try {
      const res = await this.col().updateOne(
        { _id, deletedAt: { $exists: false } },
        { $set: { deletedAt: new Date() } },
      );
      return res.modifiedCount > 0;
    } catch (error) {
      this.handleError('softDelete', error);
    }
  }

  /**
   * Hard deletes a program record effectively removing it from the database.
   */
  async hardDelete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    try {
      const res: DeleteResult = await this.col().deleteOne({ _id });
      return res.deletedCount > 0;
    } catch (error) {
      this.handleError('hardDelete', error);
    }
  }

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new Error('INVALID_ID');
    }
    return new ObjectId(id);
  }

  private toModel(doc: ProgramRecordDoc): ProgramRecord {
    return {
      id: doc._id.toHexString(),
      userId: doc.userId,
      programId: doc.programId,
      sessionId: doc.sessionId,
      sessionSnapshot: doc.sessionSnapshot,
      recordData: doc.recordData,
      comment: doc.comment,
      satisfactionRating: doc.satisfactionRating,
      durationMinutes: doc.durationMinutes,
      difficultyRating: doc.difficultyRating,
      state: doc.state,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    };
  }

  private normalizeId(value?: string | null): string | undefined {
    const trimmed = value?.trim();
    return trimmed?.length ? trimmed : undefined;
  }

  private isDuplicateError(error: any): boolean {
    return error?.code === 11000;
  }

  private handleError(method: string, error: any): never {
    const message = error?.message ?? error;
    inversify.loggerService.error(`[program-record.repository] ${method} => ${message}`);
    throw error;
  }
}

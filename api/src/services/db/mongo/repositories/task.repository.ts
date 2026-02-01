// src/services/db/mongo/task.repository.ts
import { Collection, Db, ObjectId } from 'mongodb';
import inversify from '@src/inversify/investify';
import { Task } from '@services/db/models/task.model';
import {
  CreateTaskDto,
  GetTaskDto,
  ListTasksDto,
  UpdateTaskDto,
} from '@services/db/dtos/task.dto';
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';
import { toTaskPriority, toTaskStatus } from '@src/common/enum.util';

interface TaskDoc {
  _id: ObjectId;
  label: string;
  priority: TaskPriority;
  status: TaskStatus;
  day: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class BddServiceTaskMongo {
  private col(): Collection<TaskDoc> {
    return inversify.mongo.collection<TaskDoc>('tasks');
  }

  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<TaskDoc>('tasks') : this.col();
      await collection.createIndexes([
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
        { key: { createdBy: 1 }, name: 'by_createdBy' },
        { key: { priority: 1 }, name: 'by_priority' },
        { key: { status: 1 }, name: 'by_status' },
        { key: { day: 1 }, name: 'by_day' },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  async create(dto: CreateTaskDto): Promise<Task | null> {
    const now = new Date();
    const doc: Omit<TaskDoc, '_id'> = {
      label: dto.label.trim(),
      priority: toTaskPriority(dto.priority) ?? TaskPriority.LOW,
      status: toTaskStatus(dto.status) ?? TaskStatus.TODO,
      day: dto.day,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const res = await this.col().insertOne(doc as TaskDoc);
      return { id: res.insertedId.toHexString(), ...doc };
    } catch (error) {
      this.handleError('create', error);
    }
  }

  async get(dto: GetTaskDto): Promise<Task | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const doc = await this.col().findOne({ _id });
      return doc ? this.toModel(doc) : null;
    } catch (error) {
      this.handleError('get', error);
    }
  }

  async listTasks(params: ListTasksDto = {}) {
    const {
      priority,
      status,
      day,
      dayFrom,
      dayTo,
      createdBy,
      limit = 20,
      page = 1,
      sort = { updatedAt: -1 },
    } = params;

    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (createdBy) filter.createdBy = createdBy;
    if (priority) {
      const normalized = toTaskPriority(priority);
      if (normalized) filter.priority = normalized;
    }
    if (status) {
      const normalized = toTaskStatus(status);
      if (normalized) filter.status = normalized;
    }
    if (day || dayFrom || dayTo) {
      filter.day = this.buildDayRange({ day, dayFrom, dayTo });
    }

    try {
      const collection = this.col();
      const cursor = collection.find(filter).sort(sort).skip((page - 1) * limit).limit(limit);
      const [rows, total] = await Promise.all([cursor.toArray(), collection.countDocuments(filter)]);
      return { items: rows.map(this.toModel), total, page, limit };
    } catch (error) {
      this.handleError('listTasks', error);
    }
  }

  async update(id: string, patch: UpdateTaskDto): Promise<Task | null> {
    const _id = this.toObjectId(id);
    const $set: Partial<TaskDoc> = { updatedAt: new Date() };
    if (patch.label !== undefined) $set.label = patch.label.trim();
    if (patch.priority !== undefined) $set.priority = toTaskPriority(patch.priority) ?? TaskPriority.LOW;
    if (patch.status !== undefined) $set.status = toTaskStatus(patch.status) ?? TaskStatus.TODO;
    if (patch.day !== undefined) $set.day = patch.day;

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
   * Soft delete: marks task as deleted by setting deletedAt timestamp.
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
   * Hard delete: permanently removes task from database.
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

  private buildDayRange({
    day,
    dayFrom,
    dayTo,
  }: {
    day?: Date;
    dayFrom?: Date;
    dayTo?: Date;
  }): Record<string, Date> {
    if (day) {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      return { $gte: start, $lte: end };
    }

    const range: Record<string, Date> = {};
    if (dayFrom) range.$gte = dayFrom;
    if (dayTo) range.$lte = dayTo;
    return range;
  }

  private toObjectId(id: string): ObjectId {
    try { return new ObjectId(id); }
    catch { throw new Error('InvalidObjectId'); }
  }

  private toModel = (doc: TaskDoc): Task => ({
    id: doc._id.toHexString(),
    label: doc.label,
    priority: toTaskPriority(doc.priority) ?? TaskPriority.LOW,
    status: toTaskStatus(doc.status) ?? TaskStatus.TODO,
    day: doc.day,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  });

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceTaskMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}

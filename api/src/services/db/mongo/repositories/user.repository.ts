// src/services/db/mongo/user/user.repository.ts
import { Collection, Db, Document, Filter, ObjectId, Sort } from 'mongodb';
import inversify from '@src/inversify/investify';
import { User } from '@services/db/models/user.model';
import {
  CreateUserDto, GetUserDto, ListUsersDto, UpdateUserDto, UserType,
} from '@services/db/dtos/user.dto';

// --- Persisted document shape ---
interface UserDoc {
  _id: ObjectId;
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: { name: string; city: string; code: string; country: string };
  password: string;  // hashed
  company?: { name: string; address?: { name: string; city: string; code: string; country: string } };
  is_active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  schemaVersion: number;
}

export class BddServiceUserMongo {
  private col(): Collection<UserDoc> {
    return inversify.mongo.collection<UserDoc>('users');
  }

  // --- Ensure indexes (call once at bootstrap OR via migration) ---
  async ensureIndexes(db?: Db): Promise<void> {
    try {
      const collection = db ? db.collection<UserDoc>('users') : this.col();
      await collection.createIndexes([
        { key: { email: 1 }, name: 'uniq_email', unique: true },
        { key: { type: 1 }, name: 'by_type' },
        { key: { last_name: 1, first_name: 1 }, name: 'by_name' },
        { key: { 'company.name': 1 }, name: 'by_company_name', sparse: true },
        { key: { createdAt: -1 }, name: 'by_createdAt' },
        { key: { updatedAt: -1 }, name: 'by_updatedAt' },
        // NEW
        { key: { is_active: 1 }, name: 'by_is_active' },
        { key: { createdBy: 1 }, name: 'by_createdBy', sparse: true },
      ]);
    } catch (error) {
      this.handleError('ensureIndexes', error);
    }
  }

  // --- Create ---
  async createUser(dto: CreateUserDto): Promise<User> {
    const now = new Date();
    const doc: Omit<UserDoc, '_id'> = {
      type: dto.type,
      first_name: dto.first_name.trim(),
      last_name: dto.last_name.trim(),
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone,
      address: dto.address,
      password: dto.password,
      company: dto.company,
      is_active: dto.is_active ?? true,
      createdBy: dto.createdBy,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };

    try {
      const res = await (this.col()).insertOne(doc as UserDoc);
      const saved = await this.getUser({ id: res.insertedId.toHexString() }, { includePassword: false });
      if (!saved) throw new Error('Inserted but not found');
      return saved;
    } catch (error) {
      if (this.isDuplicateError(error)) {
        const err = new Error('EMAIL_ALREADY_EXISTS');
        (err as any).cause = error;
        throw err;
      }
      this.handleError('createUser', error);
    }
  }

  // --- Read one by id ---
  async getUser(dto: GetUserDto, opts?: { includePassword?: boolean }): Promise<User | null> {
    try {
      const _id = this.toObjectId(dto.id);
      const projection = this.makeProjection(!!opts?.includePassword);
      const doc = await (this.col()).findOne({ _id }, { projection });
      return doc ? this.toModel(doc, !!opts?.includePassword) : null;
    } catch (error) {
      this.handleError('getUser', error);
    }
  }

  // --- Read one by email ---
  async getUserByEmail(email: string, opts?: { includePassword?: boolean }): Promise<User | null> {
    try {
      const projection = this.makeProjection(!!opts?.includePassword);
      const doc = await (this.col()).findOne({ email: email.toLowerCase().trim() }, { projection });
      return doc ? this.toModel(doc, !!opts?.includePassword) : null;
    } catch (error) {
      this.handleError('getUserByEmail', error);
    }
  }

  // --- List with filters/pagination ---
  async listUsers(params: ListUsersDto = {}): Promise<{ items: User[]; total: number; page: number; limit: number }> {
    const {
      q, type, companyName, includePassword = false,
      limit = 20, page = 1, sort = { createdAt: -1 } as Record<string, 1 | -1>,
      // NEW
      is_active, createdBy,
    } = params;

    const filter: Filter<UserDoc> = {};
    if (type) filter.type = type;
    if (companyName?.trim()) {
      filter['company.name' as keyof UserDoc] = new RegExp(companyName.trim(), 'i') as any;
    }
    if (typeof is_active === 'boolean') filter.is_active = is_active;
    if (createdBy?.trim()) filter.createdBy = createdBy.trim();

    if (q?.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { first_name: regex },
        { last_name: regex },
        { email: regex },
        { phone: regex },
        { 'company.name': regex } as any,
      ];
    }

    const projection = this.makeProjection(includePassword);
    try {
      const cursor = (this.col())
        .find(filter, { projection })
        .sort(sort as Sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const [rows, total] = await Promise.all([
        cursor.toArray(),
        (this.col()).countDocuments(filter),
      ]);

      return {
        items: rows.map((d) => this.toModel(d, includePassword)),
        total,
        page,
        limit,
      };
    } catch (error) {
      this.handleError('listUsers', error);
    }
  }

  // --- Update (partial) ---
  async updateUser(id: string, patch: UpdateUserDto): Promise<User | null> {
    if ((patch as any).password !== undefined) {
      throw new Error('Password update not allowed here. Use updatePassword().');
    }

    const _id = this.toObjectId(id);
    const $set: Partial<UserDoc> = { updatedAt: new Date() };

    if (patch.type !== undefined) $set.type = patch.type;
    if (patch.first_name !== undefined) $set.first_name = patch.first_name.trim();
    if (patch.last_name !== undefined) $set.last_name = patch.last_name.trim();
    if (patch.email !== undefined) $set.email = patch.email.toLowerCase().trim();
    if (patch.phone !== undefined) $set.phone = patch.phone;
    if (patch.address !== undefined) $set.address = patch.address as any;
    if (patch.company !== undefined) $set.company = patch.company as any;
    if (patch.is_active !== undefined) $set.is_active = patch.is_active;
    if (patch.createdBy !== undefined) $set.createdBy = patch.createdBy;

    try {
      const res: any = await (this.col()).findOneAndUpdate(
        { _id }, { $set }, { returnDocument: 'after', projection: this.makeProjection(false) }
      );
      return res.value ? this.toModel(res.value, false) : null;
    } catch (error) {
      if (this.isDuplicateError(error)) {
        const err = new Error('EMAIL_ALREADY_EXISTS');
        (err as any).cause = error;
        throw err;
      }
      this.handleError('updateUser', error);
    }
  }

  // --- Update password (hash already prepared) ---
  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await (this.col()).updateOne(
        { _id }, { $set: { password: hashedPassword, updatedAt: new Date() } }
      );
      return res.matchedCount === 1;
    } catch (error) {
      this.handleError('updatePassword', error);
    }
  }

  // --- Delete ---
  async deleteUser(id: string): Promise<boolean> {
    try {
      const _id = this.toObjectId(id);
      const res = await (this.col()).deleteOne({ _id });
      return res.deletedCount === 1;
    } catch (error) {
      this.handleError('deleteUser', error);
    }
  }

  // --- Utils ---
  private toObjectId(id: string): ObjectId {
    try { return new ObjectId(id); }
    catch { throw new Error('InvalidObjectId'); }
  }

  private makeProjection(includePassword: boolean): Document {
    return includePassword ? { schemaVersion: 0 } : { password: 0, schemaVersion: 0 };
  }

  private toModel(doc: Partial<UserDoc> & { _id?: ObjectId }, keepPassword: boolean): User {
    const user: User = {
      id: String(doc._id),
      type: doc.type!,
      first_name: doc.first_name!,
      last_name: doc.last_name!,
      email: doc.email!,
      phone: doc.phone,
      address: doc.address as any,
      company: doc.company as any,
      is_active: !!doc.is_active,
      createdBy: doc.createdBy??'',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      schemaVersion: doc.schemaVersion,
    };
    if (keepPassword && (doc as any).password) {
      user.password = (doc as any).password as string;
    }
    return user;
  }

  private isDuplicateError(error: unknown): boolean {
    return typeof error === 'object' && error !== null && (error as { code?: number }).code === 11000;
  }

  private handleError(method: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    inversify.loggerService.error(`BddServiceUserMongo#${method} => ${message}`);
    throw error instanceof Error ? error : new Error(message);
  }
}


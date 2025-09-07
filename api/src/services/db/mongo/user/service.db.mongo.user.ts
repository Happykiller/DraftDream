import * as mongoDB from "mongodb";

// ---- Types de domaine (alignés sur ton modèle) ----
export type UserType = "athlete" | "coach" | "admin";

export interface Address {
  name: string;
  city: string;
  code: string;
  country: string;
}

export interface Company {
  name: string;
  address?: Address;
}

// Document stocké en BDD (driver natif)
export interface UserDoc {
  _id: mongoDB.ObjectId;
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;               // normalisé en lowercase
  phone?: string;
  address?: Address;
  password: string;            // hash (argon2) fourni par la couche usecase
  company?: Company;
  createdAt?: Date;
  updatedAt?: Date;
  schemaVersion?: number;
}

// Types d’E/S côté service (POJO)
export interface UserPojo {
  _id: string;
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: Address;
  // password jamais exposé sauf sur demande explicite
  password?: string;
  company?: Company;
  createdAt?: Date;
  updatedAt?: Date;
  schemaVersion?: number;
}

export type NewUser = Omit<UserPojo, "_id" | "createdAt" | "updatedAt" | "schemaVersion">;

export type UserPatch = Partial<
  Omit<UserPojo, "_id" | "password" | "createdAt" | "updatedAt" | "schemaVersion">
>;

export interface ListQuery {
  q?: string;
  type?: UserType;
  limit?: number;      // défaut 20
  page?: number;       // défaut 1
  sort?: mongoDB.Sort; // ex: { createdAt: -1 }
  includePassword?: boolean; // false par défaut
}

/**
 * Service User basé sur le driver natif MongoDB.
 * Injection: inversify.mongo est un mongoDB.Db
 */
export class BddServiceUserMongo {
  private readonly collectionName = "users";

  constructor(
    private readonly inversify: { mongo: mongoDB.Db },
  ) {}

  private col(): mongoDB.Collection<UserDoc> {
    return this.inversify.mongo.collection<UserDoc>(this.collectionName);
  }

  /** À appeler au démarrage pour garantir les index */
  async init(): Promise<void> {
    await this.col().createIndexes([
      { key: { email: 1 }, name: "uniq_email", unique: true },
      { key: { type: 1 }, name: "by_type" },
      { key: { last_name: 1, first_name: 1 }, name: "by_name" },
      { key: { "company.name": 1 }, name: "by_company_name", sparse: true },
    ]);
  }

  // -------------------- CREATE --------------------

  async createUser(input: NewUser): Promise<UserPojo> {
    const now = new Date();

    // normalisations minimales
    const payload: Omit<UserDoc, "_id"> = {
      type: input.type,
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email.toLowerCase().trim(),
      phone: input.phone,
      address: input.address,
      password: input.password!, // hash déjà fourni par la couche usecase
      company: input.company,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };

    try {
      const res = await this.col().insertOne(payload as UserDoc);
      // relire sans le password
      const saved = await this.getById(res.insertedId.toHexString(), { includePassword: false });
      if (!saved) throw new Error("Inserted but not found");
      return saved;
    } catch (e: any) {
      // duplicate email
      if (e?.code === 11000) {
        const err = new Error("EMAIL_ALREADY_EXISTS");
        (err as any).cause = e;
        throw err;
      }
      throw e;
    }
  }

  // -------------------- READ --------------------

  async getById(id: string, opts?: { includePassword?: boolean }): Promise<UserPojo | null> {
    const _id = this.toObjectId(id);
    const projection = this.makeProjection(!!opts?.includePassword);
    const doc = await this.col().findOne({ _id }, { projection });
    return doc ? this.toPojo(doc, !!opts?.includePassword) : null;
  }

  async getByEmail(email: string, opts?: { includePassword?: boolean }): Promise<UserPojo | null> {
    const projection = this.makeProjection(!!opts?.includePassword);
    const doc = await this.col().findOne(
      { email: email.toLowerCase().trim() },
      { projection }
    );
    return doc ? this.toPojo(doc, !!opts?.includePassword) : null;
  }

  async list(query: ListQuery = {}): Promise<{ items: UserPojo[]; total: number; page: number; limit: number }> {
    const {
      q,
      type,
      limit = 20,
      page = 1,
      sort = { createdAt: -1 } as mongoDB.Sort,
      includePassword = false,
    } = query;

    const filter: mongoDB.Filter<UserDoc> = {};
    if (type) filter.type = type;
    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { first_name: regex },
        { last_name: regex },
        { email: regex },
        { phone: regex },
        { "company.name": regex },
      ] as any;
    }

    const projection = this.makeProjection(includePassword);

    const cursor = this.col()
      .find(filter, { projection })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    const [rows, total] = await Promise.all([cursor.toArray(), this.col().countDocuments(filter)]);
    const items = rows.map((d) => this.toPojo(d, includePassword));
    return { items, total, page, limit };
  }

  // -------------------- UPDATE --------------------

  async updatePartial(id: string, patch: UserPatch): Promise<UserPojo | null> {
    if ((patch as any).password !== undefined) {
      throw new Error("Password update not allowed here. Use updatePassword().");
    }

    const _id = this.toObjectId(id);
    const $set: Partial<UserDoc> = { ...patch, updatedAt: new Date() };
    if ($set.email) $set.email = $set.email.toLowerCase().trim();

    const res:any = await this.col().findOneAndUpdate(
      { _id },
      { $set },
      {
        returnDocument: "after",
        projection: this.makeProjection(false),
      }
    );
    return res.value ? this.toPojo(res.value, false) : null;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const res = await this.col().updateOne(
      { _id },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );
    return res.matchedCount === 1;
  }

  // -------------------- DELETE --------------------

  async delete(id: string): Promise<boolean> {
    const _id = this.toObjectId(id);
    const res = await this.col().deleteOne({ _id });
    return res.deletedCount === 1;
  }

  // -------------------- Utils --------------------

  private toObjectId(id: string): mongoDB.ObjectId {
    try {
      return new mongoDB.ObjectId(id);
    } catch {
      throw new Error("Invalid ObjectId");
    }
  }

  private makeProjection(includePassword: boolean): mongoDB.Document {
    // On cache password par défaut
    return includePassword ? { schemaVersion: 0 } : { password: 0, schemaVersion: 0 };
  }

  private toPojo(doc: Partial<UserDoc> & { _id?: mongoDB.ObjectId }, keepPassword: boolean): UserPojo {
    const pojo: UserPojo = {
      _id: String(doc._id),
      type: doc.type as UserType,
      first_name: doc.first_name!,
      last_name: doc.last_name!,
      email: doc.email!,
      phone: doc.phone,
      address: doc.address,
      company: doc.company,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      schemaVersion: doc.schemaVersion,
    };
    if (keepPassword && (doc as any).password) {
      (pojo as any).password = (doc as any).password as string;
    }
    return pojo;
  }
}

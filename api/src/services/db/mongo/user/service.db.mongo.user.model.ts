// src\services\db\mongo\user\service.db.mongo.user.model.ts
import mongoose, { Schema, Document, Model, Connection } from "mongoose";

export type UserType = "athlete" | "coach" | "admin";

export interface Address {
  name: string;     // ligne d'adresse / rue
  city: string;
  code: string;     // code postal
  country: string;  // ISO 3166-1 alpha-2 recommandé en entrée
}

export interface Company {
  name: string;
  address?: Address;
}

export interface IUser extends Document {
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: Address;
  password: string;
  company?: Company;
}

const AddressSchema = new Schema<Address>(
  {
    name: { type: String, trim: true, maxlength: 256 },
    city: { type: String, trim: true, maxlength: 128 },
    code: { type: String, trim: true, maxlength: 32 },
    country: { type: String, trim: true, maxlength: 64 },
  },
  { _id: false }
);

const CompanySchema = new Schema<Company>(
  {
    name: { type: String, trim: true, maxlength: 128 },
    address: { type: AddressSchema, default: undefined },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    type: {
      type: String,
      enum: ["athlete", "coach", "admin"],
      required: true,
      index: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      // RFC5322-light
      match:
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      trim: true,
      // format E.164 simple: +{1-15 digits}
      match: /^\+\d{6,15}$/,
      maxlength: 20,
    },
    address: { type: AddressSchema, default: undefined },
    password: {
      type: String,
      required: true,
      select: false,          // exclu des requêtes par défaut
      minlength: 60,          // longueur d'un hash bcrypt (guardrail)
      maxlength: 100,
    },
    company: { type: CompanySchema, default: undefined },
  },
  {
    timestamps: true,
    versionKey: "schemaVersion",
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        // évite TS2790
        Reflect.deleteProperty(ret, "password");
        Reflect.deleteProperty(ret, "__v");
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        Reflect.deleteProperty(ret, "password");
        Reflect.deleteProperty(ret, "__v");
        return ret;
      },
    },
  }
);

// Index utiles
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ last_name: 1, first_name: 1 });
UserSchema.index({ "company.name": 1 }, { sparse: true });

/** Factory: retourne le Model attaché à **cette** connexion */
export const getUserModel = (conn: Connection): Model<IUser> =>
  conn.models.User || conn.model<IUser>("User", UserSchema);

// (Optionnel) compat : export par défaut global si tu en as besoin ailleurs
export default (mongoose.models.User || mongoose.model<IUser>("User", UserSchema));
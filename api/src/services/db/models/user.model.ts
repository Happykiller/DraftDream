// src/services/db/models/user.model.ts

export type UserType = 'athlete' | 'coach' | 'admin';

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

export interface User {
  id: string;
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: Address;
  company?: Company;
  createdAt?: Date;
  updatedAt?: Date;
  schemaVersion?: number;
  /** Only present when explicitly requested (includePassword=true) */
  password?: string;
}

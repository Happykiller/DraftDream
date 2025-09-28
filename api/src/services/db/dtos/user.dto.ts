// src/services/db/dto/user.dto.ts

export type UserType = 'athlete' | 'coach' | 'admin';

export type AddressDto = {
  name: string;
  city: string;
  code: string;
  country: string; // ISO 3166-1 alpha-2 recommandé
};

export type CompanyDto = {
  name: string;
  address?: AddressDto;
};

export type CreateUserDto = {
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;          // will be lowercased/trimmed
  password: string;       // already hashed (argon2/bcrypt)
  phone?: string;
  address?: AddressDto;
  company?: CompanyDto;
  is_active?: boolean;
  createdBy: string; 
};

export interface UpdateUserDto {
  type?: UserType;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: AddressDto;
  company?: CompanyDto;
  is_active?: boolean;
  createdBy?: string;
}

export type GetUserDto = { id: string };

export type ListUsersDto = {
  q?: string;                 // regex on first_name/last_name/email/phone/company.name
  type?: UserType;
  companyName?: string;       // exact/regex on company.name
  includePassword?: boolean;  // default false
  limit?: number;             // default 20
  page?: number;              // default 1
  sort?: Record<string, 1 | -1>; // e.g. { createdAt: -1 }
  is_active?: boolean;
  createdBy?: string;
};

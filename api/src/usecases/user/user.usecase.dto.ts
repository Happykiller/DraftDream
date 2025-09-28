// src/usecases/user/dto/user.usecase.dto.ts

export type UserType = "athlete" | "coach" | "admin";

export interface AddressDto {
  name: string;
  city: string;
  code: string;
  country: string;
}

export interface CompanyDto {
  name: string;
  address?: AddressDto;
}

export interface CreateUserUsecaseDto {
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: AddressDto;
  password: string;
  confirm_password?: string;
  company?: CompanyDto;
  is_active: boolean;
  createdBy: string;
}

export interface GetUserUsecaseDto {
  id: string;
}

export interface ListUserUsecaseDto {
  q?: string;
  type?: UserType;
  companyName?: string;
  is_active?: boolean;
  createdBy?: string;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}

export interface UpdateUserUsecaseDto {
  id: string;
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
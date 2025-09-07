// src/usecases/user/dto/create-user.usecase.dto.ts

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
}

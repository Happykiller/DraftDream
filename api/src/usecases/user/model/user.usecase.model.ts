// src\usecases\user\model\user.usecase.model.ts
export type UserType = "athlete" | "coach" | "admin";

export interface AddressModel {
  name: string;
  city: string;
  code: string;
  country: string;
}

export interface CompanyModel {
  name: string;
  address?: AddressModel;
}

export interface UserUsecaseModel {
  id: string;
  type: UserType;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: AddressModel;
  company?: CompanyModel;
  createdAt?: Date;
  updatedAt?: Date;
}

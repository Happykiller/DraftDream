// src/services/db/models/category.model.ts
export interface Category {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

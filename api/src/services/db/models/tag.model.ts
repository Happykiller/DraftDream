// src/services/db/models/tag.model.ts
export interface Tag {
  id: string;
  slug: string;
  locale: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

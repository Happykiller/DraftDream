// src/services/db/models/client/activity-preference.model.ts
export interface ClientActivityPreference {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

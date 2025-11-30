// src/services/db/models/client/activity-preference.model.ts
export interface ProspectActivityPreference {
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

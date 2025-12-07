// src/services/db/models/client/activity-preference.model.ts
export interface ProspectActivityPreference {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

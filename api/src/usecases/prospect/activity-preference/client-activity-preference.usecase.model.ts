// src/usecases/client/activity-preference/client-activity-preference.usecase.model.ts
export interface ClientActivityPreferenceUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

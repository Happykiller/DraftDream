// src\services\db\models\muscle.ts
export interface Muscle {
  id: string;
  slug: string;
  locale: string;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

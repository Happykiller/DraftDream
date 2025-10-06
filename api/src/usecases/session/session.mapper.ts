// src\usecases\session\session.mapper.ts
import { Session } from '@services/db/models/session.model';
import type { SessionUsecaseModel } from '@usecases/session/session.usecase.model';

export const mapSessionToUsecase = (s: Session): SessionUsecaseModel => ({
  id: s.id,
  slug: s.slug,
  locale: s.locale,
  title: s.title,
  durationMin: s.durationMin,
  description: s.description,
  exerciseIds: [...s.exerciseIds],
  createdBy: typeof s.createdBy === 'string' ? s.createdBy : s.createdBy.id,
  deletedAt: s.deletedAt,
  createdAt: s.createdAt,
  updatedAt: s.updatedAt,
});

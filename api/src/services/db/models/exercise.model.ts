// src/services/db/models/exercise.model.ts
import { Tag } from '@services/db/models/tag.model';
import { User } from '@services/db/models/user.model';
import { Muscle } from '@services/db/models/muscle.model';
import { Category } from '@services/db/models/category.model';
import { Equipment } from '@services/db/models/equipment.model';

export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  instructions?: string;
  level: ExerciseLevel;
  series: string;
  repetitions: string,
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: 'private' | 'public';

  // Relations
  categories: Category[];
  muscles: Muscle[];
  equipment?: Equipment[];
  tags?: Tag[];

  // Ownership & metadata
  createdBy: string | User;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

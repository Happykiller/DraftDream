// src\services\db\mongo\exercise\service.db.mongo.exercice.model.ts
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseStatus = 'draft' | 'active' | 'archived';
export type Visibility = 'private' | 'public';

export interface Exercise {
  _id: string;
  visibility: Visibility;
  status: ExerciseStatus;

  locale: string;

  categoryId: string;              // ref Category
  difficulty: Difficulty;

  videoUrl?: string;

  muscle: {
    musclesIds: string[];          // refs Muscle
    custom?: string[];             // user-entered labels
  };

  equipment: {
    equipmentIds: string[];        // refs Equipment
    custom?: string[];             // user-entered labels
  };

  tag?: {
    tagsId?: string[];                 // ref Tag slugs or ids (design choice)
    custom?: string[];           // user-entered tags
  };

  sets?: string;                   // default recommendation
  reps?: string;                   // range or explicit list
  load?: string;                   // free text: "20kg", "bodyweight", "RPE 7"
  restSeconds?: number;
  tempo?: string;                  // e.g., "3-1-1"

  instruction?: string;          // markdown

  name: string;

  // audit
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

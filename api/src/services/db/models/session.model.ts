// src\services\db\models\session.model.ts
import { User } from '@services/db/models/user.model';

export interface Session {
  id: string;
  slug: string;
  locale: string;
  label: string;
  /** Duration in minutes; must be a positive integer */
  durationMin: number;

  /** Optional long text */
  description?: string;

  /**
   * Ordered list of exercise IDs.
   * The array index is the order (0..n). Do not sort this array implicitly.
   */
  exerciseIds: string[];

  // Ownership & metadata (aligned with Exercise)
  createdBy: string | User;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

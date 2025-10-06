// src\\services\\db\\models\\program.model.ts
import { User } from '@services/db/models/user.model';

export interface Program {
  id: string;
  name: string;
  /** Duration in weeks; must be a positive integer. */
  duration: number;
  /** Number of training sessions per week. */
  frequency: number;
  description?: string;
  /** Ordered list of session IDs. Array index represents the order. */
  sessionIds: string[];
  createdBy: string | User;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

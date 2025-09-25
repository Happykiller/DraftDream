// src/service/db/db.service.ts
// ---- User domain ----
import type { User } from '@services/db/models/user.model';
import type {
  CreateUserDto, UpdateUserDto, ListUsersDto,
} from '@services/db/dtos/user.dto';

// ---- Equipment domain ----
import type { Equipment } from '@services/db/models/equipment.model';
import type {
  CreateEquipmentDto, UpdateEquipmentDto, ListEquipmentDto,
} from '@services/db/dtos/equipment.dto';

// ---- Category domain ----
import type { Category } from '@services/db/models/category.model';
import type {
  CreateCategoryDto, UpdateCategoryDto, ListCategoriesDto,
} from '@services/db/dtos/category.dto';

// ---- Tag domain ----
import type { Tag } from '@services/db/models/tag.model';
import type {
  CreateTagDto, UpdateTagDto, ListTagsDto,
} from '@services/db/dtos/tag.dto';

// ---- Muscle domain ----
import type { Muscle } from '@services/db/models/muscle.model';
import type {
  CreateMuscleDto, UpdateMuscleDto, ListMusclesDto, GetMuscleDto,
} from '@services/db/dtos/muscle.dto';

// ----------------------
// Public Facade Contract
// ----------------------
export interface BddService {
  /** Healthcheck simple (ping DB). */
  test(): Promise<boolean>;

  /** Initialize DB connection (idempotent). */
  initConnection(): Promise<void>;

  /** Ensure indexes on all collections (safe to call multiple times). */
  ensureIndexes(): Promise<void>;

  /** Close connection gracefully. */
  close(): Promise<void>;

  // ---------- Users ----------
  getUserById(id: string, opts?: { includePassword?: boolean }): Promise<User | null>;
  getUserByEmail(email: string, opts?: { includePassword?: boolean }): Promise<User | null>;
  listUsers(query?: ListUsersDto): Promise<{ items: User[]; total: number; page: number; limit: number }>;
  createUser(input: CreateUserDto): Promise<User>;
  updateUser(id: string, patch: UpdateUserDto): Promise<User | null>;
  updateUserPassword(id: string, hashedPassword: string): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;

  // ------- Equipments -------
  createEquipment(dto: CreateEquipmentDto): Promise<Equipment | null>;
  getEquipment(id: string): Promise<Equipment | null>;
  listEquipments(params?: ListEquipmentDto): Promise<{ items: Equipment[]; total: number; page: number; limit: number }>;
  updateEquipment(id: string, patch: UpdateEquipmentDto): Promise<Equipment | null>;
  deleteEquipment(id: string): Promise<boolean>;

  // -------- Categories -------
  createCategory(dto: CreateCategoryDto): Promise<Category | null>;
  getCategory(id: string): Promise<Category | null>;
  listCategories(params?: ListCategoriesDto): Promise<{ items: Category[]; total: number; page: number; limit: number }>;
  updateCategory(id: string, patch: UpdateCategoryDto): Promise<Category | null>;
  deleteCategory(id: string): Promise<boolean>;

  // ----------- Tags ----------
  createTag(dto: CreateTagDto): Promise<Tag | null>;
  getTag(id: string): Promise<Tag | null>;
  listTags(params?: ListTagsDto): Promise<{ items: Tag[]; total: number; page: number; limit: number }>;
  updateTag(id: string, patch: UpdateTagDto): Promise<Tag | null>;
  deleteTag(id: string): Promise<boolean>;

  // --------- Muscles ---------
  createMuscle(dto: CreateMuscleDto): Promise<Muscle | null>;
  getMuscle(dto: GetMuscleDto): Promise<Muscle | null>;
  listMuscles(params?: ListMusclesDto): Promise<{ items: Muscle[]; total: number; page: number; limit: number }>;
  updateMuscle(id: string, patch: UpdateMuscleDto): Promise<Muscle | null>;
  deleteMuscle(id: string): Promise<boolean>;
}
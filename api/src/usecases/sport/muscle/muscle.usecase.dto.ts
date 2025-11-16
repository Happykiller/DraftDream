// src/usecases/muscle/dto/create.muscle.usecase.dto.ts
export interface CreateMuscleUsecaseDto {
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  createdBy: string;
}

// src/usecases/muscle/dto/get.muscle.usecase.dto.ts
// We mirror BddService GetMuscleDto shape (id OR slug+locale).
export interface GetMuscleUsecaseDto {
  id: string;
}

// src/usecases/muscle/dto/list.muscles.usecase.dto.ts
export interface ListMusclesUsecaseDto {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: 'private' | 'public';
  limit?: number;
  page?: number;
  sort?: { updatedAt?: 1 | -1 };
}

// src/usecases/muscle/dto/update.muscle.usecase.dto.ts
export interface UpdateMuscleUsecaseDto {
  id: string;
  slug?: string;
  locale?: string;
  label?: string;
}

// src/usecases/muscle/dto/delete.muscle.usecase.dto.ts
export interface DeleteMuscleUsecaseDto {
  id: string;
}

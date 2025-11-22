import { CreateProspectLevelDto, UpdateProspectLevelDto } from "@src/services/db/dtos/prospect/level.dto";

export type CreateProspectLevelUsecaseDto = Omit<CreateProspectLevelDto, 'slug'>;

export type UpdateProspectLevelUsecaseDto = Omit<UpdateProspectLevelDto, 'slug'>;
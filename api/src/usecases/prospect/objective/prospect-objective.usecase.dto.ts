import { CreateProspectObjectiveDto, UpdateProspectObjectiveDto } from "@src/services/db/dtos/prospect/objective.dto";

export type CreateProspectObjectiveUsecaseDto = Omit<CreateProspectObjectiveDto, 'slug'>;

export type UpdateProspectObjectiveUsecaseDto = Omit<UpdateProspectObjectiveDto, 'slug'>;
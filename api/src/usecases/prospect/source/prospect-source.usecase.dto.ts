import { CreateProspectSourceDto, UpdateProspectSourceDto } from "@src/services/db/dtos/prospect/source.dto";

export type CreateProspectSourceUsecaseDto = Omit<CreateProspectSourceDto, 'slug'>;

export type UpdateProspectSourceUsecaseDto = Omit<UpdateProspectSourceDto, 'slug'>;
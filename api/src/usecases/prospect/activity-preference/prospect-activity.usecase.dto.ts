import { CreateProspectActivityPreferenceDto, UpdateProspectActivityPreferenceDto } from "@src/services/db/dtos/prospect/activity-preference.dto";

export type CreateProspectActivityPreferenceUsecaseDto = Omit<CreateProspectActivityPreferenceDto, 'slug'>;

export type UpdateProspectActivityPreferenceUsecaseDto = Omit<UpdateProspectActivityPreferenceDto, 'slug'>;
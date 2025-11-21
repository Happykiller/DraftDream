// src/usecases/client/objective/create.client-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';
import { CreateClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';

export class CreateClientObjectiveUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateClientObjectiveUsecaseDto): Promise<ClientObjectiveUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'client-objective' });
      const created = await this.inversify.bddService.clientObjective.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateClientObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_CLIENT_OBJECTIVE_USECASE);
    }
  }
}

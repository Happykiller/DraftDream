// src/usecases/client/objective/update.client-objective.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';
import { UpdateClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';

export class UpdateClientObjectiveUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: UpdateClientObjectiveUsecaseDto): Promise<ClientObjectiveUsecaseModel | null> {
    try {
      const updated = await this.inversify.bddService.clientObjective.update(dto.id, {
        slug: dto.slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
      });
      return updated ? { ...updated } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`UpdateClientObjectiveUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.UPDATE_CLIENT_OBJECTIVE_USECASE);
    }
  }
}

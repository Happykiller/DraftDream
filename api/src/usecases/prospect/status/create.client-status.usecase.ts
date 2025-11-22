// src/usecases/client/status/create.client-status.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';
import { CreateClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';

export class CreateClientStatusUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateClientStatusUsecaseDto): Promise<ClientStatusUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'client-status' });
      const created = await this.inversify.bddService.clientStatus.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateClientStatusUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_CLIENT_STATUS_USECASE);
    }
  }
}

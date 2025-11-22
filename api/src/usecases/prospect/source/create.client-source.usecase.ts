// src/usecases/client/source/create.client-source.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { buildSlug } from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';
import { CreateClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';

export class CreateClientSourceUsecase {
  constructor(private readonly inversify: Inversify) {}

  async execute(dto: CreateClientSourceUsecaseDto): Promise<ClientSourceUsecaseModel | null> {
    try {
      const slug = buildSlug({ label: dto.label, fallback: 'client-source' });
      const created = await this.inversify.bddService.clientSource.create({
        slug,
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      });
      return created ? { ...created } : null;
    } catch (error: any) {
      this.inversify.loggerService.error(`CreateClientSourceUsecase#execute => ${error?.message ?? error}`);
      throw new Error(ERRORS.CREATE_CLIENT_SOURCE_USECASE);
    }
  }
}

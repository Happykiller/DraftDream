// src\usecase\auth\auth.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { AuthUsecaseDto } from '@usecases/auth/dtos/auth.usecase.dto';
import { SessionUsecaseModel } from '@usecases/auth/models/session.usecase.model';

export class AuthUsecase {
  inversify: Inversify;

  constructor(inversify: Inversify) {
    this.inversify = inversify;
  }

  async execute(dto: AuthUsecaseDto): Promise<SessionUsecaseModel> {
    try {
      const user = await this.inversify.bddService.user.getUserByEmail(dto.email, { includePassword: true });
      if (!user?.password) throw new Error(ERRORS.INVALID_CREDENTIALS);

      const ok = await this.inversify.cryptService.verify({ message: dto.password, hash: user.password });
      if (!ok) throw new Error(ERRORS.INVALID_CREDENTIALS);

      const token = await this.inversify.jwtService.sign({
        id: user.id,
        role: user.type.toUpperCase(),
        email: user.email,
        type: 'access',
      });

      return {
        access_token: token
      };
    } catch (e) {
      this.inversify.loggerService.error(`AuthUsecase#execute=>${e.message}`);

      throw normalizeError(e, ERRORS.AUTH_USECASE_FAIL);
    }
  }
}

// src\usecase\auth\auth.usecase.ts
import { ERRORS } from '@src/common/ERROR';
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
      const user = await this.inversify.bddService.getByEmail(dto.email, { includePassword: true });
      if (!user || !user.password) throw new Error(ERRORS.INVALID_CREDENTIALS);

      const ok = await this.inversify.cryptService.verify({ message: dto.password, hash: user.password });
      if (!ok) throw new Error(ERRORS.INVALID_CREDENTIALS);

      const token = await this.inversify.jwtService.sign({
        id: user._id,
        role: user.type.toUpperCase(),
        email: user.email,
        type: 'access',
      });

      return {
        access_token: token
      };
    } catch (e) {
      this.inversify.loggerService.error(`AuthUsecase#execute=>${e.message}`);

      // Check if error message is in ERRORS values
      const knownErrors = Object.values(ERRORS);
      if (knownErrors.includes(e.message)) {
        throw e; // rethrow as-is
      }

      // Fallback: standardize as AUTH_USECASE_FAIL
      throw new Error(ERRORS.AUTH_USECASE_FAIL);
    }
  }
}

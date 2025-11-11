// src/services/crypt/crypt.service.real.ts
import * as argon2 from 'argon2';
import { config } from '@src/config';
import { ERRORS } from '@src/common/ERROR';
import inversify from '@src/inversify/investify';
import { CryptService } from '@services/crypt/crypt.service';
import { CryptServiceDto, CryptVerifyDto } from '@services/crypt/dto/crypt.service.dto';

interface Argon2Config {
  timeCost?: number;      // itérations (défaut: 2/3)
  memoryCost?: number;    // en KiB (défaut: 19_456 = ~19MB)
  parallelism?: number;   // threads (défaut: 1/2 selon machine)
  hashLength?: number;    // octets de hash (défaut: 32)
}

export class CryptServiceReal implements CryptService {
  constructor(private readonly config: { argon2?: Argon2Config } = {}) {}

  async hash(dto: CryptServiceDto): Promise<string> {
    try {
      const opts: argon2.Options & { raw?: false } = {
        type: argon2.argon2id,
        timeCost: this.config.argon2?.timeCost ?? 3,
        memoryCost: this.config.argon2?.memoryCost ?? 19456, // ~19MB
        parallelism: this.config.argon2?.parallelism ?? 1,
        hashLength: this.config.argon2?.hashLength ?? 32,
        secret: Buffer.from(config.jwt.secret),
      };
      // Génère un sel aléatoire automatiquement; renvoie une chaîne $argon2id$... portable
      return await argon2.hash(dto.message, opts);
    } catch (e: any) {
      inversify.loggerService.error(`CryptServiceReal#hash => ${e?.message ?? e}`);
      throw new Error(ERRORS.CRYPT_SERVICE_FAIL);
    }
  }

  async verify(dto: CryptVerifyDto): Promise<boolean> {
    try {
      return await argon2.verify(dto.hash, dto.message, {
        secret: Buffer.from(config.jwt.secret),
      });
    } catch (e: any) {
      inversify.loggerService.warn(`CryptServiceReal#verify => ${e?.message ?? e}`);
      // Par sécurité on peut retourner false si le hash est corrompu
      return false;
    }
  }
}

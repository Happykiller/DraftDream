// src/services/crypt/crypt.service.real.ts
import * as argon2 from 'argon2';
import { config } from '@src/config';
import { ERRORS } from '@src/common/ERROR';
import inversify from '@src/inversify/investify';
import { CryptService } from '@services/crypt/crypt.service';
import { CryptServiceDto, CryptVerifyDto } from '@services/crypt/dto/crypt.service.dto';

interface Argon2Config {
  timeCost?: number;      // iterations (default: 2/3)
  memoryCost?: number;    // KiB (default: 19_456 ≈ 19MB)
  parallelism?: number;   // threads (default: 1/2 depending on machine)
  hashLength?: number;    // hash bytes (default: 32)
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
      // Automatically generates a random salt and returns a portable $argon2id$ string
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
      // Return false when the hash is corrupted to avoid leaking details
      return false;
    }
  }
}

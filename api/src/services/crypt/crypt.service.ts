// src\services\crypt\crypt.service.ts
import { CryptServiceDto, CryptVerifyDto } from './dto/crypt.service.dto';

export interface CryptService {
  hash(dto: CryptServiceDto): Promise<string>;
  verify(dto: CryptVerifyDto): Promise<boolean>;
}

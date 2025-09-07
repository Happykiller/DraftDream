// src\services\crypt\dto\crypt.service.dto.ts
export interface CryptServiceDto {
  message: string;
  secret?: string;
}

export interface CryptVerifyDto {
  message: string; // mot de passe en clair
  hash: string;    // hash argon2 stocké
}
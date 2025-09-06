// src\config\loadEnv.ts
import * as fs from 'fs';
import * as dotenv from 'dotenv';

export function loadEnv(): Record<string, string> {
  const env = dotenv.config().parsed || {};
  const envLocal = fs.existsSync('.env.local') ? dotenv.config({ path: '.env.local' }).parsed : {};
  return { ...env, ...envLocal };
}

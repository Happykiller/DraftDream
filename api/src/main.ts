// src\main.ts
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { config } from '@src/config';
import { AppModule } from '@src/app.module';
import inversify from '@src/inversify/investify';
import { NestLogger } from '@src/common/nestLogger';

async function bootstrap() {
    inversify.loggerService.log(
    'info',
    `Environnement selected: ${config.env.mode} on port ${config.env.port ?? 3000}`,
  );

  const app = await NestFactory.create<NestFastifyApplication>(AppModule,
    new FastifyAdapter(), {
    logger: new NestLogger(),
    // logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

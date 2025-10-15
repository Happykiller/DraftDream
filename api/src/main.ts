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

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(), {
    logger: new NestLogger(),
    // logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const isDev = config.env.mode === 'dev';

  if (isDev) {
    app.enableCors();
  } else {
    inversify.loggerService.log(
      'info',
      'Cors enable',
    );
    app.enableCors({
      origin: ['https://bo.fitdesk.happykiller.net', 'https://fo.fitdesk.happykiller.net', 'https://mobile.fitdesk.happykiller.net'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Apollo-Require-Preflight',
      ],
      credentials: true,
      maxAge: 600,
    });
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen({ port, host: '0.0.0.0' });
}
bootstrap();

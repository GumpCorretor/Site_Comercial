import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import type { DatabaseHealthCheck } from './application/health/database-health-check';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './interface/http/filters/global-exception.filter';

export interface CreateAppOptions {
  readonly databaseUrl: string;
  readonly databaseHealthCheck?: DatabaseHealthCheck;
}

export async function createApp(options: CreateAppOptions): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({
    logger: {
      base: { context: 'api' },
      messageKey: 'message',
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
    },
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register(options),
    adapter,
    { logger: false },
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  const openApiConfig = new DocumentBuilder()
    .setTitle('Central Comercial API')
    .setDescription('Documentação do scaffold inicial da API.')
    .setVersion('0.0.0')
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('docs', app, openApiDocument);

  return app;
}

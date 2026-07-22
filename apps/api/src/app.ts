import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module.js'

/**
 * Monta a aplicação Nest sobre o adapter Fastify e expõe a documentação
 * OpenAPI/Swagger. Não inicia o listener: produção e testes decidem como usar
 * a instância retornada.
 */
export async function buildServer(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  const config = new DocumentBuilder()
    .setTitle('MCMV Platform API')
    .setDescription('REST API do app api — scaffold T-03 (NestJS + Fastify)')
    .setVersion('0.0.1')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  return app
}

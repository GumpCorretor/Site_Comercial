import 'reflect-metadata'

import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app.module.js'

const DEFAULT_PORT = 3001

/**
 * Monta a aplicação Nest sobre o adapter Fastify e expõe a documentação
 * OpenAPI/Swagger dos endpoints da base. Não inicia o listener — quem chama
 * decide se sobe uma porta (main) ou injeta requisições em memória (testes).
 */
export async function buildServer(): Promise<NestFastifyApplication> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  const config = new DocumentBuilder()
    .setTitle('MCMV Platform API')
    .setDescription('REST API do app api — scaffold T-03 (NestJS + Fastify)')
    .setVersion('0.0.1')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  return app
}

async function main(): Promise<void> {
  const app = await buildServer()
  const port = Number(process.env.PORT ?? DEFAULT_PORT)
  await app.listen(port, '0.0.0.0')
  console.log(`api (nest+fastify) listening on ${port}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

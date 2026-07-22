import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildServer } from './app.js'

// Teste de fumaça sugerido pela T-03: a API sobe (Nest + Fastify) e a rota
// base + o JSON do Swagger respondem, sem abrir uma porta de rede real.
test('api boots on fastify and exposes base route + swagger json', async () => {
  const app = await buildServer()
  await app.init()
  const fastify = app.getHttpAdapter().getInstance()

  try {
    const rootResponse = await fastify.inject({ method: 'GET', url: '/' })
    assert.equal(rootResponse.statusCode, 200)

    const docsJsonResponse = await fastify.inject({
      method: 'GET',
      url: '/docs-json',
    })
    assert.equal(docsJsonResponse.statusCode, 200)
  } finally {
    await app.close()
  }
})

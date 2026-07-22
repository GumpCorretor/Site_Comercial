import { test } from 'node:test'
import assert from 'node:assert/strict'

import { run } from './runner.js'

test('worker inicia e encerra de forma limpa (boot de fumaça)', async () => {
  await assert.doesNotReject(run())
})

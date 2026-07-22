import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { URL } from 'node:url'

const distUrl = new URL('../dist/', import.meta.url)

test('vite build emits a runnable React scaffold', async () => {
  const html = await readFile(new URL('index.html', distUrl), 'utf8')

  assert.match(html, /<div id="root"><\/div>/)

  const scriptMatch = html.match(/<script[^>]+src="([^"]+\.js)"/)
  assert.ok(scriptMatch, 'built index.html must reference a JavaScript asset')

  const assetPath = scriptMatch[1].replace(/^\//, '')
  const bundle = await readFile(new URL(assetPath, distUrl), 'utf8')
  assert.match(bundle, /MCMV Platform/)
  assert.match(bundle, /web skeleton/)

  const assets = await readdir(new URL('assets/', distUrl))
  assert.ok(assets.some((file) => file.endsWith('.js')))
})

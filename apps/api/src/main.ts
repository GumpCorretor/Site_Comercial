import { buildServer } from './app.js'

const DEFAULT_PORT = 3001

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

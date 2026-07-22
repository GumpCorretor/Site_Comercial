import { buildServer } from './server.js'

async function main(): Promise<void> {
  const server = buildServer()
  await server.start(3001)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

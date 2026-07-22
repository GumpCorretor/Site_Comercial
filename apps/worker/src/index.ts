import { run } from './runner.js'

async function main(): Promise<void> {
  await run()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

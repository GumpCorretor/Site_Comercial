export function buildServer(): { start(port: number): Promise<void> } {
  return {
    async start(port: number): Promise<void> {
      console.log(`api skeleton listening on ${port}`)
    },
  }
}

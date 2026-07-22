export function bootstrap(): void {
  const root = document.getElementById('root')
  if (root) {
    root.textContent = 'web skeleton'
  }
}

bootstrap()

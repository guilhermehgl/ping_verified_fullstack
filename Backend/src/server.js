import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { createApp } from './app/app.js'
import { env } from './config/env.js'
import { assertLocalRuntime } from './config/local-mode.js'

export async function startServer({ localMode = false, port = env.port, packaged = false } = {}) {
  if (localMode) assertLocalRuntime()
  const app = createApp({ localMode, packaged })
  let timer
  if (localMode) {
    // Public startup never initializes the database, probes or notifications.
    const { connectDatabase } = await import('./database/connection.js')
    const { runMonitoring } = await import('./services/monitoring.service.js')
    await connectDatabase()
    const cycle = () => runMonitoring().catch(() => console.error('Falha no ciclo de monitoramento'))
    await cycle()
    timer = setInterval(cycle, env.monitoringIntervalMs)
  }
  const server = app.listen(port, localMode ? '127.0.0.1' : '0.0.0.0')
  server.on('close', () => clearInterval(timer))
  server.on('error', () => clearInterval(timer))
  return server
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await startServer({ localMode: process.argv.includes('--local'), packaged: process.argv.includes('--packaged'),
    port: process.argv.includes('--packaged') ? env.webappPort : env.port })
}

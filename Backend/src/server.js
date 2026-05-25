import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'

import { createApp } from './app/app.js'
import { env } from './config/env.js'
import { connectDatabase } from './database/connection.js'
import { runMonitoring } from './services/monitoring.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const frontendDistPath = path.resolve(__dirname, '../../Frontend/dist')
const frontendIndexPath = path.join(frontendDistPath, 'index.html')
const isPackagedMode = process.argv.includes('--packaged')
const port = isPackagedMode ? env.webappPort : env.devPort

const app = createApp()

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath))
  app.get(/^(?!\/(?:devices|events|health)(?:\/|$)).*/, (req, res) => {
    res.sendFile(frontendIndexPath)
  })
}

await connectDatabase()
await runMonitoring()
setInterval(runMonitoring, env.monitoringIntervalMs)

app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`)
})

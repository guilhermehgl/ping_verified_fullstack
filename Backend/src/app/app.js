import express from 'express'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import cors from 'cors'

import devicesRoutes from '../routes/devices.routes.js'
import eventsRoutes from '../routes/events.routes.js'
import { env } from '../config/env.js'
import { notFoundHandler } from '../middlewares/not-found.middleware.js'
import { errorHandler } from '../middlewares/error.middleware.js'
import { assertLocalRuntime, localRequestsOnly } from '../config/local-mode.js'

export function createApp({ localMode = false, packaged = false } = {}) {
  if (localMode) assertLocalRuntime()
  const app = express()
  const frontendDist = fileURLToPath(new URL('../../../Frontend/dist/', import.meta.url))
  const serveFrontend = localMode && packaged && existsSync(frontendDist + 'index.html')
  if (localMode) app.use(localRequestsOnly)

  app.use(
    cors({
      origin(origin, callback) {
        // Permite chamadas sem Origin (ex: healthcheck/servidor-servidor)
        if (!origin) return callback(null, true)

        if (env.allowedOrigins.includes(origin)) {
          return callback(null, true)
        }

        const error = new Error('Origin nao permitida pelo CORS')
        error.statusCode = 403
        return callback(error)
      }
    })
  )
  app.use(express.json())

  app.get('/', (req, res) => {
    if (serveFrontend) return res.sendFile(frontendDist + 'index.html')
    res.json({
      message: 'Servidor online',
      frontend: 'https://ping-verified-fullstack.vercel.app/#dashboard',
      healthcheck: '/health'
    })
  })

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  if (localMode) {
    app.use('/devices', devicesRoutes)
    app.use('/events', eventsRoutes)
  } else {
    app.use(['/devices', '/events'], (req, res) => {
      res.status(403).json({ error: 'API pública sem inventário, sondagens ou operações reais' })
    })
  }

  if (serveFrontend) app.use(express.static(frontendDist))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

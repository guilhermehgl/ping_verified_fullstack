import express from 'express'
import cors from 'cors'

import devicesRoutes from '../routes/devices.routes.js'
import eventsRoutes from '../routes/events.routes.js'
import { env } from '../config/env.js'
import { notFoundHandler } from '../middlewares/not-found.middleware.js'
import { errorHandler } from '../middlewares/error.middleware.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        // Permite chamadas sem Origin (ex: healthcheck/servidor-servidor)
        if (!origin) return callback(null, true)

        if (env.allowedOrigins.includes(origin)) {
          return callback(null, true)
        }

        return callback(new Error('Origin nao permitida pelo CORS'))
      }
    })
  )
  app.use(express.json())

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/devices', devicesRoutes)
  app.use('/events', eventsRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

import express from 'express'
import cors from 'cors'

import devicesRoutes from '../routes/devices.routes.js'
import eventsRoutes from '../routes/events.routes.js'
import { notFoundHandler } from '../middlewares/not-found.middleware.js'
import { errorHandler } from '../middlewares/error.middleware.js'

export function createApp() {
  const app = express()

  app.use(cors())
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

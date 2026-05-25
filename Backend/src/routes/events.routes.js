import { Router } from 'express'
import { listEvents } from '../controllers/event.controller.js'
import { asyncHandler } from '../utils/async-handler.js'

const router = Router()

router.get('/', asyncHandler(listEvents))

export default router

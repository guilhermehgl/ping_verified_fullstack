import { Router } from 'express'
import { getDevices, postBulkDelete, postDevice, putDevice } from '../controllers/device.controller.js'
import { asyncHandler } from '../utils/async-handler.js'

const router = Router()

router.get('/', asyncHandler(getDevices))
router.post('/', asyncHandler(postDevice))
router.put('/:id', asyncHandler(putDevice))
router.post('/bulk-delete', asyncHandler(postBulkDelete))

export default router

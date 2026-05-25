import { EventModel } from '../database/models/event.model.js'
import { MAX_EVENTS } from '../constants/monitoring.js'

export async function addEvent(event) {
  await EventModel.create({ ...event, deviceId: String(event.deviceId) })
  const total = await EventModel.estimatedDocumentCount()

  if (total > MAX_EVENTS) {
    const overflow = total - MAX_EVENTS
    const oldest = await EventModel.find().sort({ at: 1 }).limit(overflow).select('_id').lean()
    if (oldest.length) {
      await EventModel.deleteMany({ _id: { $in: oldest.map((item) => item._id) } })
    }
  }
}

export async function getEvents() {
  return EventModel.find().sort({ at: -1 }).limit(MAX_EVENTS).lean()
}

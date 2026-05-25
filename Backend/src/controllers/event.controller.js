import { getEvents } from '../services/event.service.js'

export async function listEvents(req, res) {
  const events = await getEvents()
  res.json(events)
}

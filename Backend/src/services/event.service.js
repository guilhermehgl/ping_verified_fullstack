import { addEvent as addEventRecord, getEvents as findEvents } from '../repositories/events.repository.js'

export async function addEvent(event) {
  await addEventRecord(event)
}

export async function getEvents() {
  return findEvents()
}

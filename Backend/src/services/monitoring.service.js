import { listDevices } from './device.service.js'
import { OFFLINE_THRESHOLD, ONLINE_THRESHOLD } from '../constants/monitoring.js'
import { checkDevice } from './ping.service.js'
import { addEvent } from './event.service.js'
import { sendTelegram } from './notification.service.js'

let deviceStatus = []
let monitoringPromise = null

async function executeMonitoring() {
  const devices = await listDevices()
  const now = new Date()

  deviceStatus = await Promise.all(
    devices.map(async (device) => {
      const previous = deviceStatus.find((item) => item.id === device.id)
      const pingResult = await checkDevice(device.ip)
      const isFirstCheck = !previous

      let online = previous?.online
      let offlineSince = previous?.offlineSince ?? null
      let failCount = previous?.failCount ?? 0
      let successCount = previous?.successCount ?? 0

      if (isFirstCheck) {
        online = pingResult.online
        offlineSince = pingResult.online ? null : now
        failCount = pingResult.online ? 0 : 1
        successCount = pingResult.online ? 1 : 0
      } else if (pingResult.online) {
        successCount++
        failCount = 0
        if (!online && successCount >= ONLINE_THRESHOLD) {
          online = true
          offlineSince = null
        }
      } else {
        failCount++
        successCount = 0
        if (online && failCount >= OFFLINE_THRESHOLD) {
          online = false
          offlineSince = now
        }
      }

      if (previous && previous.online !== online) {
        await addEvent({
          deviceId: device.id,
          name: device.name,
          ip: device.ip,
          from: previous.online ? 'online' : 'offline',
          to: online ? 'online' : 'offline',
          at: now
        })

        if (!online) {
          await sendTelegram(`Dispositivo ${device.name} (${device.ip}) ficou OFFLINE`)
        } else {
          await sendTelegram(`Dispositivo ${device.name} voltou para ONLINE`)
        }
      }

      return { ...device, online, offlineSince, failCount, successCount, time: pingResult.time, lastCheck: now }
    })
  )

  return deviceStatus
}

export async function runMonitoring() {
  if (monitoringPromise) return monitoringPromise
  monitoringPromise = executeMonitoring().finally(() => {
    monitoringPromise = null
  })
  return monitoringPromise
}

export function getMonitoringStatus() {
  return deviceStatus
}

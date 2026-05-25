import ping from 'ping'
import { env } from '../config/env.js'

export async function checkDevice(ip) {
  const result = await ping.promise.probe(ip, {
    timeout: env.pingTimeoutSeconds
  })

  return {
    online: result.alive,
    time: result.time
  }
}

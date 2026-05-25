import ping from 'ping'
import net from 'net'
import { env } from '../config/env.js'

function checkTcp(ip, port, timeoutMs) {
  return new Promise((resolve) => {
    const start = Date.now()
    const socket = new net.Socket()
    let settled = false

    const finish = (online) => {
      if (settled) return
      settled = true
      const elapsedMs = Date.now() - start
      socket.destroy()
      resolve({ online, time: String(elapsedMs) })
    }

    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
    socket.connect(port, ip)
  })
}

export async function checkDevice(ip) {
  const timeoutSeconds = env.pingTimeoutSeconds
  const timeoutMs = timeoutSeconds * 1000

  if (env.monitorMethod === 'tcp') {
    return checkTcp(ip, env.monitorTcpPort, timeoutMs)
  }

  try {
    const result = await ping.promise.probe(ip, { timeout: timeoutSeconds })
    return { online: result.alive, time: result.time }
  } catch (error) {
    if (env.monitorMethod === 'icmp') {
      throw error
    }

    return checkTcp(ip, env.monitorTcpPort, timeoutMs)
  }
}

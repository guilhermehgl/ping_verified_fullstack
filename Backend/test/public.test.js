import { afterEach, describe, expect, it, vi } from 'vitest'
import { once } from 'node:events'
const io = vi.hoisted(() => ({ connect: vi.fn(), probe: vi.fn(), notify: vi.fn(), read: vi.fn() }))
vi.mock('../src/database/connection.js', () => ({ connectDatabase: io.connect }))
vi.mock('../src/services/ping.service.js', () => ({ checkDevice: io.probe }))
vi.mock('../src/services/notification.service.js', () => ({ sendTelegram: io.notify }))
vi.mock('../src/repositories/devices.repository.js', () => ({ findAllDevices: io.read,
  createDeviceRecord: vi.fn(), deleteManyDevices: vi.fn(), existsDuplicateDevice: vi.fn(),
  findDeviceById: vi.fn(), updateDeviceRecord: vi.fn() }))
vi.mock('../src/repositories/events.repository.js', () => ({ addEvent: vi.fn(), getEvents: io.read }))
import { startServer } from '../src/server.js'
import { createApp } from '../src/app/app.js'
import { localRequestsOnly } from '../src/config/local-mode.js'
let server
async function start(options) {
  server = await startServer({ port: 0, ...options })
  if (!server.listening) await once(server, 'listening')
  return 'http://127.0.0.1:' + server.address().port
}
afterEach(async () => {
  if (server?.listening) await new Promise(resolve => server.close(resolve))
  vi.unstubAllEnvs(); vi.clearAllMocks()
})
describe('Public runtime fails closed', () => {
  it('serves health and blocks all inventory/event methods, without external IO or worker', async () => {
    vi.stubEnv('NODE_ENV', 'production'); vi.stubEnv('MONGO_URI', 'must-not-be-used')
    vi.stubEnv('MONITOR_METHOD', 'tcp'); vi.stubEnv('TELEGRAM_BOT_TOKEN', 'unused-test')
    const base = await start()
    expect((await fetch(base + '/health')).status).toBe(200)
    for (const [method, path] of [['GET','/devices'],['POST','/devices'],['PUT','/devices/507f1f77bcf86cd799439011'],['POST','/devices/bulk-delete'],['GET','/events']]) {
      const r = await fetch(base + path, { method })
      expect(r.status).toBe(403)
      expect(await r.text()).not.toContain('must-not-be-used')
    }
    for (const fn of Object.values(io)) expect(fn).not.toHaveBeenCalled()
  })
  it.each(['NODE_ENV','RENDER','VERCEL'])('refuses local command on hosted/production runtime: %s', async key => {
    vi.stubEnv(key, key === 'NODE_ENV' ? 'production' : 'true')
    await expect(startServer({ localMode: true, port: 0 })).rejects.toThrow('somente')
    expect(() => createApp({ localMode: true })).toThrow()
    expect(io.connect).not.toHaveBeenCalled()
  })
  it('local command binds only loopback and keeps its database/monitoring startup', async () => {
    io.read.mockResolvedValue([])
    await start({ localMode: true })
    expect(server.address().address).toBe('127.0.0.1')
    expect(io.connect).toHaveBeenCalledOnce()
    expect(io.read).toHaveBeenCalledOnce()
  })
  it('refuses remote peers and non-local Host, irrespective of forwarded headers', () => {
    const res={ status:vi.fn().mockReturnThis(),json:vi.fn() }, next=vi.fn()
    localRequestsOnly({socket:{remoteAddress:'203.0.113.1'},hostname:'localhost'},res,next)
    localRequestsOnly({socket:{remoteAddress:'127.0.0.1'},hostname:'attacker.example'},res,next)
    expect(res.status).toHaveBeenCalledWith(403); expect(next).not.toHaveBeenCalled()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitter } from 'node:events'
const d=vi.hoisted(()=>({probe:vi.fn(),connect:vi.fn(),outcome:'connect',env:{monitorMethod:'auto',monitorTcpPort:80,pingTimeoutSeconds:2}}))
vi.mock('../src/config/env.js',()=>({env:d.env}))
vi.mock('ping',()=>({default:{promise:{probe:d.probe}}}))
vi.mock('net',()=>({default:{Socket:class extends EventEmitter {
  setTimeout(ms){this.timeout=ms} destroy(){} connect(port,ip){d.connect(port,ip);queueMicrotask(()=>this.emit(d.outcome))}
}}}))
import { checkDevice } from '../src/services/ping.service.js'
beforeEach(()=>{vi.clearAllMocks();d.env.monitorMethod='auto';d.outcome='connect'})
describe('ICMP/TCP contract',()=>{
  it('does not fallback when ICMP returns offline',async()=>{d.probe.mockResolvedValue({alive:false,time:'unknown'});expect((await checkDevice('192.0.2.1')).online).toBe(false);expect(d.connect).not.toHaveBeenCalled()})
  it('falls back on an ICMP execution error in auto mode',async()=>{d.probe.mockRejectedValue(new Error('no ICMP'));expect((await checkDevice('192.0.2.1')).online).toBe(true);expect(d.connect).toHaveBeenCalledWith(80,'192.0.2.1')})
  it('preserves errors in explicit ICMP mode',async()=>{d.env.monitorMethod='icmp';d.probe.mockRejectedValue(new Error('icmp'));await expect(checkDevice('192.0.2.1')).rejects.toThrow('icmp');expect(d.connect).not.toHaveBeenCalled()})
  it.each(['timeout','error'])('TCP %s settles offline',async outcome=>{d.env.monitorMethod='tcp';d.outcome=outcome;expect((await checkDevice('192.0.2.1')).online).toBe(false);expect(d.probe).not.toHaveBeenCalled()})
})

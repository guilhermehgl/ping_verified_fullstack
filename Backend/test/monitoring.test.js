import { beforeEach, describe, expect, it, vi } from 'vitest'
const deps=vi.hoisted(()=>({ list:vi.fn(), check:vi.fn(), event:vi.fn(), notify:vi.fn() }))
vi.mock('../src/services/device.service.js',()=>({listDevices:deps.list}))
vi.mock('../src/services/ping.service.js',()=>({checkDevice:deps.check}))
vi.mock('../src/services/event.service.js',()=>({addEvent:deps.event}))
vi.mock('../src/services/notification.service.js',()=>({sendTelegram:deps.notify}))
const devices=[{id:'one',name:'Demo 1',ip:'192.0.2.1'},{id:'two',name:'Demo 2',ip:'192.0.2.2'}]
let monitor
beforeEach(async()=>{vi.resetModules();vi.resetAllMocks();deps.list.mockResolvedValue(devices);deps.check.mockResolvedValue({online:true,time:'1'});monitor=await import('../src/services/monitoring.service.js')})
describe('Monitoring without real IO',()=>{
  it('keeps three-failure/two-success thresholds and emits transitions only once',async()=>{
    await monitor.runMonitoring(); expect(deps.event).not.toHaveBeenCalled()
    deps.check.mockResolvedValue({online:false,time:null})
    await monitor.runMonitoring(); await monitor.runMonitoring()
    expect(monitor.getMonitoringStatus().every(d=>d.online)).toBe(true)
    await monitor.runMonitoring(); expect(monitor.getMonitoringStatus().every(d=>!d.online)).toBe(true)
    await monitor.runMonitoring(); expect(deps.event).toHaveBeenCalledTimes(2)
    deps.check.mockResolvedValue({online:true,time:'1'})
    await monitor.runMonitoring(); expect(monitor.getMonitoringStatus()[0].online).toBe(false)
    await monitor.runMonitoring(); expect(monitor.getMonitoringStatus()[0].online).toBe(true)
    expect(deps.event).toHaveBeenCalledTimes(4);expect(deps.notify).toHaveBeenCalledTimes(4)
  })
  it('counts probe rejection as a failed attempt while updating the other device',async()=>{
    deps.check.mockImplementation(ip=>ip===devices[0].ip?Promise.reject(new Error('probe')):Promise.resolve({online:true,time:'2'}))
    const result=await monitor.runMonitoring()
    expect(result.map(d=>d.online)).toEqual([false,true]);expect(result[1].time).toBe('2')
  })
  it('does not repeat a transition when event/notification fails',async()=>{
    const log=vi.spyOn(console,'error').mockImplementation(()=>{})
    await monitor.runMonitoring();deps.check.mockResolvedValue({online:false,time:null})
    deps.event.mockRejectedValue(new Error('database'));deps.notify.mockRejectedValue(new Error('notify'))
    for(let i=0;i<4;i++) await monitor.runMonitoring()
    expect(monitor.getMonitoringStatus().every(d=>!d.online)).toBe(true)
    expect(deps.event).toHaveBeenCalledTimes(2);expect(deps.notify).toHaveBeenCalledTimes(2)
    log.mockRestore()
  })
  it('shares a pending cycle and permits a later cycle',async()=>{
    let release;deps.list.mockReturnValueOnce(new Promise(resolve=>{release=resolve}))
    const a=monitor.runMonitoring(),b=monitor.runMonitoring();expect(deps.list).toHaveBeenCalledOnce()
    release(devices);expect(await a).toEqual(await b)
    await monitor.runMonitoring();expect(deps.list).toHaveBeenCalledTimes(2)
  })
})

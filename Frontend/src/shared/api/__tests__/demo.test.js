// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { createDemoApi } from '../demo'
import { isLocalMode } from '../mode'
describe('Browser-only demonstration',()=>{
  it('defaults to simulation, including an accidentally local setting on a public domain',()=>{
    expect(isLocalMode(undefined,'localhost')).toBe(false)
    expect(isLocalMode('local','preview.vercel.app')).toBe(false)
    expect(isLocalMode('local','127.0.0.1')).toBe(true)
  })
  it('performs CRUD in memory, preserves neighbours and resets in a new session, with zero network',async()=>{
    const fetch=vi.spyOn(window,'fetch').mockRejectedValue(new Error('network forbidden'))
    const xhr=vi.spyOn(XMLHttpRequest.prototype,'open').mockImplementation(()=>{throw new Error('network forbidden')})
    const api=createDemoApi();const initial=(await api.get('/devices')).data
    expect(initial).toHaveLength(3);expect(initial.some(d=>!d.online)).toBe(true)
    await api.post('/devices',{name:'Browser only',ip:'203.0.113.2',group:'Test'})
    const created=(await api.get('/devices')).data.at(-1)
    await api.put('/devices/'+created.id,{name:'Edited',ip:'203.0.113.3'})
    expect((await api.get('/devices')).data.at(-1).name).toBe('Edited')
    await api.post('/devices/bulk-delete',{ids:[created.id]})
    expect((await api.get('/devices')).data).toEqual(initial)
    expect((await createDemoApi().get('/devices')).data).toHaveLength(3)
    expect(fetch).not.toHaveBeenCalled();expect(xhr).not.toHaveBeenCalled()
    fetch.mockRestore();xhr.mockRestore()
  })
  it('rejects duplicate and malformed records instead of simulating successful writes',async()=>{
    const api=createDemoApi();const [device]=(await api.get('/devices')).data
    await expect(api.post('/devices',device)).rejects.toThrow('cadastrado')
    await expect(api.post('/devices',{name:12,ip:'demo.test'})).rejects.toThrow()
    await expect(api.put('/devices/missing',{name:'Demo',ip:'demo.test'})).rejects.toThrow('não encontrado')
  })
})

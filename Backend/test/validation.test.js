import { describe, expect, it, vi } from 'vitest'
import { validateCreateDeviceInput as create, validateUpdateDeviceInput as update, validateBulkDeleteInput as remove } from '../src/validators/device.validator.js'
import { errorHandler } from '../src/middlewares/error.middleware.js'
const id='507f1f77bcf86cd799439011'
describe('Input boundaries', () => {
  it.each(['192.0.2.1','2001:db8::1','printer.example.test','printer-01'])('accepts IP/hostname %s', ip => {
    expect(create({ name:' Demo ',ip }).name).toBe('Demo')
  })
  it.each([null,12,[],{},'', 'a'.repeat(101)])('rejects invalid name %j', name => {
    expect(() => create({ name,ip:'192.0.2.1' })).toThrow()
  })
  it.each([null,42,{},'http://example.test','999.1.2.3','bad host','-bad.test','a;whoami'])('rejects invalid target %j', ip => {
    expect(() => create({ name:'Demo',ip })).toThrow()
  })
  it.each([null,42,{},'', 'a'.repeat(61)])('rejects invalid group %j', group => {
    expect(() => create({ name:'Demo',ip:'192.0.2.1',group })).toThrow()
  })
  it('validates the whole batch, ObjectIds and updates', () => {
    expect(remove({ ids:[id,id] })).toEqual([id])
    expect(update({id},{name:'Demo',ip:'demo.test'}).id).toBe(id)
    for (const ids of [[],[id,'bad'],[1],null,Array(101).fill(id)]) expect(() => remove({ids})).toThrow()
    expect(() => update({id:'NaN'},{name:'Demo',ip:'demo.test'})).toThrow()
  })
  it('maps duplicate keys to 409 and hides unexpected internal details', () => {
    const res={status:vi.fn().mockReturnThis(),json:vi.fn()}
    errorHandler({code:11000,message:'private'}, {}, res)
    expect(res.status).toHaveBeenCalledWith(409)
    const log=vi.spyOn(console,'error').mockImplementation(()=>{})
    errorHandler(new Error('private'), {}, res)
    expect(res.status).toHaveBeenLastCalledWith(500)
    expect(res.json).toHaveBeenLastCalledWith({error:'Erro interno do servidor'})
    log.mockRestore()
  })
})

// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeviceGroups from '../DeviceGroups.vue'
const api=vi.hoisted(()=>({post:vi.fn().mockResolvedValue({}),put:vi.fn().mockResolvedValue({})}))
vi.mock('../../services/api.js',()=>({api}))
const devices=[{id:'507f1f77bcf86cd799439011',name:'Device A',ip:'192.0.2.1',group:'Demo',online:true},{id:'507f1f77bcf86cd799439012',name:'Device B',ip:'192.0.2.2',group:'Demo',online:true}]
let wrapper
afterEach(()=>{wrapper?.unmount();vi.clearAllMocks()})
async function select(mode) {
  wrapper=mount(DeviceGroups,{props:{devices}})
  await wrapper.get('.device-groups__toggle').trigger('click')
  await wrapper.get('[aria-label="'+mode+' dispositivos"]').trigger('click')
}
describe('ObjectId selection',()=>{
  it('keeps individual selection and deselection distinct, deleting only the selected ID',async()=>{
    await select('Excluir');const boxes=wrapper.findAll('input[type=checkbox]')
    await boxes[0].setValue(true);expect(boxes[1].element.checked).toBe(false)
    await boxes[0].setValue(false);expect(boxes.every(b=>!b.element.checked)).toBe(true)
    await boxes[1].setValue(true)
    await wrapper.get('.device-groups__selection-button:not(.device-groups__selection-button--ghost)').trigger('click');await flushPromises()
    expect(api.post).toHaveBeenCalledWith('/devices/bulk-delete',{ids:[devices[1].id]})
    expect(wrapper.emitted('changed')).toHaveLength(1)
  })
  it('edits only the selected device without confusing ObjectIds',async()=>{
    await select('Editar');await wrapper.findAll('input[type=checkbox]')[1].setValue(true)
    await wrapper.get('.device-groups__selection-button:not(.device-groups__selection-button--ghost)').trigger('click')
    expect(wrapper.get('input[placeholder="Nome do dispositivo"]').element.value).toBe('Device B')
    await wrapper.get('input[placeholder="Nome do dispositivo"]').setValue('Device B edited')
    await wrapper.get('.device-edit-modal form').trigger('submit');await flushPromises()
    expect(api.put).toHaveBeenCalledExactlyOnceWith('/devices/'+devices[1].id,{name:'Device B edited',ip:'192.0.2.2'})
    expect(wrapper.find('.device-edit-modal').exists()).toBe(false)
  })
  it('queues exactly the two checked IDs and advances to the next edit',async()=>{
    await select('Editar');for(const box of wrapper.findAll('input[type=checkbox]')) await box.setValue(true)
    await wrapper.get('.device-groups__selection-button:not(.device-groups__selection-button--ghost)').trigger('click')
    expect(wrapper.get('.device-edit-modal__progress').text()).toBe('1 de 2')
    await wrapper.get('.device-edit-modal form').trigger('submit');await flushPromises()
    expect(wrapper.get('input[placeholder="Nome do dispositivo"]').element.value).toBe('Device B')
    await wrapper.get('.device-edit-modal form').trigger('submit');await flushPromises()
    expect(api.put.mock.calls.map(c=>c[0])).toEqual(devices.map(d=>'/devices/'+d.id))
  })
  it('drops selection when devices disappear after a refresh',async()=>{
    await select('Excluir');await wrapper.findAll('input[type=checkbox]')[0].setValue(true)
    await wrapper.setProps({devices:[devices[1]]})
    expect(wrapper.get('.device-groups__selection-count').text()).toBe('0 selecionado(s)')
  })
})

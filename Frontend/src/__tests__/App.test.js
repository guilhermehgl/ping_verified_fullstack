// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ref, nextTick } from 'vue'
const fetchDevices=vi.hoisted(()=>vi.fn())
vi.mock('../modules/devices/services/devices.api',()=>({fetchDevices,createDevice:vi.fn(),updateDevice:vi.fn(),bulkDeleteDevices:vi.fn()}))
vi.mock('../modules/alerts/composables/useAlerts',()=>({useAlerts:()=>({alerts:ref([]),unacknowledgedOffline:ref([]),acknowledgeAll:vi.fn()})}))
import App from '../App.vue'
let wrapper
afterEach(()=>{wrapper?.unmount();vi.clearAllMocks()})
describe('Loading, error and empty states',()=>{
  it('distinguishes a failed request from an empty response and permits retry',async()=>{
    fetchDevices.mockRejectedValueOnce(new Error('API indisponível')).mockResolvedValueOnce([])
    wrapper=mount(App,{global:{plugins:[createPinia()]}});await flushPromises()
    expect(wrapper.get('[role=alert]').text()).toContain('API indisponível')
    expect(wrapper.text()).not.toContain('Nenhum dispositivo cadastrado.')
    await wrapper.get('.app-feedback button').trigger('click');await flushPromises()
    expect(wrapper.find('[role=alert]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nenhum dispositivo cadastrado.')
  })
  it('shows loading before the response and then renders counters',async()=>{
    let release;fetchDevices.mockReturnValueOnce(new Promise(resolve=>{release=resolve}))
    wrapper=mount(App,{global:{plugins:[createPinia()]}})
    await nextTick()
    expect(wrapper.get('[role=status]').text()).toContain('Carregando')
    release([{id:'one',name:'Demo',ip:'192.0.2.1',online:true}]);await flushPromises()
    expect(wrapper.find('[role=status]').exists()).toBe(false)
    expect(wrapper.text()).toContain('1 dispositivos')
    expect(wrapper.text()).toContain('Demonstração simulada')
  })
})

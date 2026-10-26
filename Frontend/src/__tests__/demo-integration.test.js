// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
vi.mock('axios',()=>({default:{create:vi.fn(()=>{throw new Error('HTTP adapter forbidden in demo')})}}))
import App from '../App.vue'
it('mounts the actual demo adapter, loads fictional data and makes no HTTP or notification calls',async()=>{
  const fetch=vi.spyOn(window,'fetch').mockRejectedValue(new Error('forbidden'))
  const xhr=vi.spyOn(XMLHttpRequest.prototype,'open').mockImplementation(()=>{throw new Error('forbidden')})
  const wrapper=mount(App,{global:{plugins:[createPinia()]}});await flushPromises()
  expect(wrapper.text()).toContain('3 dispositivos')
  expect(wrapper.text()).toContain('Switch demonstrativo')
  expect(wrapper.text()).toContain('Estado fictício, sem medição de rede')
  expect(fetch).not.toHaveBeenCalled();expect(xhr).not.toHaveBeenCalled()
  wrapper.unmount();fetch.mockRestore();xhr.mockRestore()
})

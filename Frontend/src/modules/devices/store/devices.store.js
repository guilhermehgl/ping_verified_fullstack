import { defineStore } from 'pinia'
import { bulkDeleteDevices, createDevice, fetchDevices, updateDevice } from '../services/devices.api'

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    items: [],
    isReloadingPage: false,
    lastError: '',
    hasLoaded: false,
    isLoading: false
  }),
  getters: {
    offlineCount: (state) => state.items.filter((device) => !device.online).length
  },
  actions: {
    syncDevices(apiDevices) {
      const acknowledgedById = new Map(this.items.map((device) => [device.id, device.acknowledged]))
      this.items = apiDevices.map((device) => ({
        ...device,
        acknowledged: acknowledgedById.get(device.id) ?? device.online
      }))
    },
    async loadDevices(showReloadScreen = false) {
      try {
        this.isLoading = true
        if (showReloadScreen) this.isReloadingPage = true
        const data = await fetchDevices()
        this.syncDevices(data)
        this.hasLoaded = true
        this.lastError = ''
      } catch (error) {
        this.lastError = error.message
      } finally {
        this.isLoading = false
        if (showReloadScreen) this.isReloadingPage = false
      }
    },
    async createDevice(payload) { await createDevice(payload); await this.loadDevices() },
    async updateDevice(id, payload) { await updateDevice(id, payload); await this.loadDevices() },
    async bulkDelete(ids) { await bulkDeleteDevices(ids); await this.loadDevices() }
  }
})

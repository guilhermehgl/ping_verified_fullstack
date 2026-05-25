import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDevicesStore } from '../devices.store'

describe('useDevicesStore', () => {
  it('calculates offline count', () => {
    setActivePinia(createPinia())
    const store = useDevicesStore()

    store.items = [
      { id: 1, online: true },
      { id: 2, online: false },
      { id: 3, online: false }
    ]

    expect(store.offlineCount).toBe(2)
  })
})

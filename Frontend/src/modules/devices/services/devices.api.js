import { apiClient } from '../../../shared/api/client'

export async function fetchDevices() {
  const { data } = await apiClient.get('/devices')
  return data
}

export async function createDevice(payload) {
  await apiClient.post('/devices', payload)
}

export async function updateDevice(id, payload) {
  await apiClient.put(`/devices/${id}`, payload)
}

export async function bulkDeleteDevices(ids) {
  await apiClient.post('/devices/bulk-delete', { ids })
}

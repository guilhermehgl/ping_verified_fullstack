import {
  validateBulkDeleteInput,
  validateCreateDeviceInput,
  validateUpdateDeviceInput
} from '../validators/device.validator.js'
import { bulkDeleteDevices, createDevice, updateDevice } from '../services/device.service.js'
import { getMonitoringStatus, runMonitoring } from '../services/monitoring.service.js'

async function refreshMonitoringSafely() {
  try {
    await runMonitoring()
  } catch (error) {
    console.error('Erro ao atualizar monitoramento apos alteracoes:', error)
  }
}

export async function getDevices(req, res) {
  res.json(getMonitoringStatus())
}

export async function postDevice(req, res) {
  const input = validateCreateDeviceInput(req.body)
  await createDevice(input)
  await refreshMonitoringSafely()
  res.status(201).json({ message: 'Dispositivo adicionado' })
}

export async function putDevice(req, res) {
  const input = validateUpdateDeviceInput(req.params, req.body)
  await updateDevice(input)
  await refreshMonitoringSafely()
  res.json({ message: 'Dispositivo atualizado' })
}

export async function postBulkDelete(req, res) {
  const ids = validateBulkDeleteInput(req.body)
  const removedCount = await bulkDeleteDevices(ids)
  await refreshMonitoringSafely()
  res.json({ message: 'Dispositivos removidos', removedCount })
}

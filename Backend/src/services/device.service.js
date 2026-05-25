import { AppError } from '../errors/app-error.js'
import {
  createDeviceRecord,
  deleteManyDevices,
  existsDuplicateDevice,
  findAllDevices,
  findDeviceById,
  updateDeviceRecord
} from '../repositories/devices.repository.js'

export async function listDevices() {
  return findAllDevices()
}

export async function createDevice(input) {
  if (await existsDuplicateDevice(input)) {
    throw new AppError('Esse dispositivo ja esta cadastrado nesse grupo', 409)
  }

  return createDeviceRecord(input)
}

export async function updateDevice(input) {
  const existing = await findDeviceById(input.id)

  if (!existing) {
    throw new AppError('Dispositivo nao encontrado', 404)
  }

  if (await existsDuplicateDevice({ name: input.name, ip: input.ip, group: existing.group }, input.id)) {
    throw new AppError('Ja existe outro dispositivo com esses dados nesse grupo', 409)
  }

  await updateDeviceRecord(input.id, { name: input.name, ip: input.ip })
}

export async function bulkDeleteDevices(ids) {
  const removedCount = await deleteManyDevices(ids)

  if (!removedCount) {
    throw new AppError('Nenhum dispositivo encontrado para exclusao', 404)
  }

  return removedCount
}

import { AppError } from '../errors/app-error.js'
import { DEFAULT_GROUP } from '../constants/monitoring.js'

export function normalizeName(value) {
  return value?.trim()
}

export function normalizeIp(value) {
  return value?.trim()
}

export function normalizeGroup(value) {
  return value?.trim() || DEFAULT_GROUP
}

export function validateCreateDeviceInput(body) {
  const name = normalizeName(body?.name)
  const ip = normalizeIp(body?.ip)
  const group = normalizeGroup(body?.group)

  if (!name || !ip) {
    throw new AppError('Nome e IP sao obrigatorios', 400)
  }

  return { name, ip, group }
}

export function validateUpdateDeviceInput(params, body) {
  const id = params?.id
  const name = normalizeName(body?.name)
  const ip = normalizeIp(body?.ip)

  if (!id || typeof id !== 'string') {
    throw new AppError('ID invalido', 400)
  }

  if (!name || !ip) {
    throw new AppError('Nome e IP sao obrigatorios', 400)
  }

  return { id, name, ip }
}

export function validateBulkDeleteInput(body) {
  const ids = Array.isArray(body?.ids)
    ? body.ids.filter((id) => typeof id === 'string' && id.trim())
    : []

  if (!ids.length) {
    throw new AppError('Selecione ao menos um dispositivo', 400)
  }

  return ids
}

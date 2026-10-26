import { isIP } from 'node:net'
import { AppError } from '../errors/app-error.js'
import { DEFAULT_GROUP } from '../constants/monitoring.js'

function text(value, label, max, optional = false) {
  if (optional && value === undefined) return DEFAULT_GROUP
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new AppError(label + ' deve ser texto preenchido de até ' + max + ' caracteres', 400)
  }
  return value.trim()
}

export function normalizeName(value) { return text(value, 'Nome', 100) }
export function normalizeGroup(value) { return text(value, 'Grupo', 60, true) }
export function normalizeIp(value) {
  const host = text(value, 'IP ou hostname', 253)
  const hostname = host.replace(/\.$/, '')
  const validHostname = !/^[\d.]+$/.test(hostname) && hostname.split('.').every(label =>
    /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))
  if (!isIP(host) && !validHostname) throw new AppError('IP ou hostname invalido', 400)
  return host
}

export function validId(id) {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) throw new AppError('ID invalido', 400)
  return id
}

export function validateCreateDeviceInput(body) {
  return { name: normalizeName(body?.name), ip: normalizeIp(body?.ip), group: normalizeGroup(body?.group) }
}

export function validateUpdateDeviceInput(params, body) {
  return { id: validId(params?.id), name: normalizeName(body?.name), ip: normalizeIp(body?.ip) }
}

export function validateBulkDeleteInput(body) {
  if (!Array.isArray(body?.ids) || !body.ids.length || body.ids.length > 100) {
    throw new AppError('Selecione entre 1 e 100 dispositivos', 400)
  }
  return [...new Set(body.ids.map(validId))]
}

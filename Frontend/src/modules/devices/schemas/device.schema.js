export function validateDevicePayload(payload) {
  const name = payload?.name?.trim() || ''
  const ip = payload?.ip?.trim() || ''
  const group = payload?.group?.trim() || 'Sem grupo'

  if (!name || !ip) {
    throw new Error('Nome e IP sao obrigatorios.')
  }

  return { name, ip, group }
}

// Browser memory only. No timers, network adapters, storage or server-side inventory.
const initialDevices = [
  { id: '507f1f77bcf86cd799439011', name: 'Roteador demonstrativo', ip: '192.0.2.10', group: 'Rede exemplo', online: true },
  { id: '507f1f77bcf86cd799439012', name: 'Switch demonstrativo', ip: '192.0.2.20', group: 'Rede exemplo', online: false },
  { id: '507f1f77bcf86cd799439013', name: 'Impressora demonstrativa', ip: '198.51.100.10', group: 'Impressão exemplo', online: true }
]

export function createDemoApi() {
  let devices = initialDevices.map(d => ({ ...d, lastCheck: new Date().toISOString(), time: null,
    offlineSince: d.online ? null : new Date().toISOString() }))
  const copy = value => structuredClone(value)
  function fields(payload) {
    const { name, ip, group } = payload || {}
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 ||
        typeof ip !== 'string' || !ip.trim() || ip.trim().length > 253 ||
        (group !== undefined && (typeof group !== 'string' || !group.trim() || group.trim().length > 60))) {
      throw new Error('Preencha nome, endereço e grupo válidos (até 100, 253 e 60 caracteres).')
    }
    return { name: name.trim(), ip: ip.trim(), group: group?.trim() || 'Sem grupo' }
  }
  function noDuplicate(input, excludeId) {
    if (devices.some(d => d.id !== excludeId && ['name','ip','group'].every(k =>
      d[k].toLowerCase() === input[k].toLowerCase()))) throw new Error('Dispositivo já cadastrado nesse grupo.')
  }
  return {
    async get(path) {
      if (path !== '/devices') throw new Error('Operação indisponível na demonstração.')
      return { data: copy(devices) }
    },
    async post(path, payload) {
      if (path === '/devices') {
        const input = fields(payload)
        noDuplicate(input)
        devices.push({ ...input, id: crypto.randomUUID().replaceAll('-', '').slice(0,24), online: true,
          offlineSince: null, lastCheck: new Date().toISOString(), time: null })
      } else if (path === '/devices/bulk-delete') {
        if (!Array.isArray(payload?.ids) || !payload.ids.length || payload.ids.some(id => typeof id !== 'string')) {
          throw new Error('Selecione dispositivos válidos.')
        }
        devices = devices.filter(d => !payload.ids.includes(d.id))
      } else throw new Error('Operação indisponível na demonstração.')
      return { data: { message: 'Demonstração atualizada somente neste navegador.' } }
    },
    async put(path, payload) {
      const id = path.startsWith('/devices/') ? path.slice('/devices/'.length) : ''
      const index = devices.findIndex(d => d.id === id)
      if (index < 0) throw new Error('Dispositivo demonstrativo não encontrado.')
      const input = fields({ ...payload, group: devices[index].group })
      noDuplicate(input, id)
      devices[index] = { ...devices[index], ...input }
      return { data: { message: 'Dispositivo demonstrativo atualizado.' } }
    }
  }
}

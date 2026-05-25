import { ref, computed, watch } from 'vue'

export function useAlerts(devices) {
  const alerts = ref([])
  // Guarda apenas o mínimo necessário para detectar transições entre polls.
  const previousDevices = ref([])

  function showToast(message, type = 'error') {
    const id = Date.now()
    alerts.value.push({ id, message, type })
    setTimeout(() => {
      alerts.value = alerts.value.filter(a => a.id !== id)
    }, 4000)
  }

  function notify(title, body) {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    new Notification(title, { body })
  }

  watch(
    devices,
    (newDevices) => {
      newDevices.forEach(device => {
        const prev = previousDevices.value.find(d => d.id === device.id)

        // Alerta apenas na transição para offline; polls seguintes não devem duplicar toast.
        if ((!prev && !device.online) || (prev && prev.online && !device.online)) {
          if (device.acknowledged !== false) {
            device.acknowledged = false
            showToast(`🔴 ${device.name} ficou offline`, 'error')
            notify('Dispositivo Offline', `${device.name} (${device.ip}) ficou offline`)
          }
        }

        // Recuperação limpa o estado pendente e gera um único feedback de retorno.
        if (prev && !prev.online && device.online) {
          device.acknowledged = true
          showToast(`🟢 ${device.name} voltou online`, 'success')
          notify('Dispositivo Online', `${device.name} voltou a responder`)
        }

        // Na carga inicial apenas estabelece baseline; não cria alerta retroativo.
        if (!prev) {
          device.acknowledged = device.online
          previousDevices.value.push({ id: device.id, online: device.online })
        } else {
          // Atualiza o baseline só quando houve transição real de estado.
          if (prev.online !== device.online) {
            prev.online = device.online
          }
        }
      })
    },
    { deep: true }
  )

  const unacknowledgedOffline = computed(() =>
    devices.value.filter(d => !d.online && !d.acknowledged)
  )

  function acknowledgeAll() {
    devices.value.forEach(d => {
      if (!d.online) d.acknowledged = true
    })
  }

  return {
    alerts,
    acknowledgeAll,
    unacknowledgedOffline
  }
}

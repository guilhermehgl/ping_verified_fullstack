<script setup>
import { computed } from 'vue'
import DeviceList from '../../devices/components/DeviceList.vue'

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
})

const offlineDevices = computed(() =>
  props.devices.filter(device => !device.online)
)

const onlineDevices = computed(() =>
  props.devices.length - offlineDevices.value.length
)

const lastCheck = computed(() => {
  const timestamps = props.devices
    .map(device => device.lastCheck ? new Date(device.lastCheck).getTime() : 0)
    .filter(Boolean)

  if (!timestamps.length) return null

  return Math.max(...timestamps)
})

const lastCheckLabel = computed(() => {
  if (!lastCheck.value) return 'Aguardando'
  return new Date(lastCheck.value).toLocaleTimeString()
})

const dashboardSummary = computed(() => {
  if (!props.devices.length) {
    return 'Aguardando a primeira leitura dos dispositivos.'
  }

  if (!offlineDevices.value.length) {
    return 'Todos os dispositivos estão respondendo normalmente.'
  }

  const count = offlineDevices.value.length
  const suffix = count > 1 ? 's' : ''

  return `${count} dispositivo${suffix} offline no momento.`
})
</script>

<template>
  <section class="dashboard-page">
    <header class="dashboard-page__header">
      <div class="dashboard-page__title-block">
        <p class="dashboard-page__eyebrow">Status do ambiente</p>
        <h2>Dashboard</h2>
        <p class="dashboard-page__summary">{{ dashboardSummary }}</p>
      </div>
    </header>

    <section class="dashboard-page__stats">
      <article class="dashboard-stat ui-surface dashboard-stat--danger">
        <span class="dashboard-stat__label">Offline</span>
        <strong class="dashboard-stat__value">{{ offlineDevices.length }}</strong>
        <span class="dashboard-stat__meta">Dispositivos com indisponibilidade</span>
      </article>

      <article class="dashboard-stat ui-surface">
        <span class="dashboard-stat__label">Online</span>
        <strong class="dashboard-stat__value">{{ onlineDevices }}</strong>
        <span class="dashboard-stat__meta">Respondendo normalmente</span>
      </article>

      <article class="dashboard-stat ui-surface">
        <span class="dashboard-stat__label">Última verificação</span>
        <strong class="dashboard-stat__value">{{ lastCheckLabel }}</strong>
        <span class="dashboard-stat__meta">Horário mais recente do monitoramento</span>
      </article>
    </section>

    <section class="dashboard-panel ui-surface">
      <div class="dashboard-panel__header">
        <div>
          <p class="dashboard-panel__eyebrow">Fila de atenção</p>
          <h3>Dispositivos offline</h3>
        </div>

        <span class="ui-chip ui-chip--danger">
          {{ offlineDevices.length }} offline
        </span>
      </div>

      <p v-if="lastCheck" class="dashboard-panel__last-check">
        Atualizado às {{ new Date(lastCheck).toLocaleTimeString() }}
      </p>

      <DeviceList
        :devices="offlineDevices"
        empty-message="Nenhum dispositivo offline no momento."
      />
    </section>
  </section>
</template>


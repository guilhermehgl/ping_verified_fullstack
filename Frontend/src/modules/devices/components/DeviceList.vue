<script setup>
import { computed } from 'vue'

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  },
  emptyMessage: {
    type: String,
    default: 'Nenhum dispositivo encontrado.'
  }
})

function timeAgo(date) {
  if (!date) return 'agora'

  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`

  return `há ${Math.floor(hours / 24)} dias`
}

const sortedDevices = computed(() => {
  return [...props.devices].sort((a, b) => {
    const aTime = a.offlineSince
      ? new Date(a.offlineSince).getTime()
      : Number.MAX_SAFE_INTEGER
    const bTime = b.offlineSince
      ? new Date(b.offlineSince).getTime()
      : Number.MAX_SAFE_INTEGER

    return aTime - bTime || a.name.localeCompare(b.name, 'pt-BR')
  })
})
</script>

<template>
  <div class="device-list">
    <p v-if="!sortedDevices.length" class="device-list__empty ui-empty-state">
      {{ emptyMessage }}
    </p>

    <article
      v-for="device in sortedDevices"
      :key="device.id"
      class="device-list__item"
    >
      <div class="device-list__header">
        <div>
          <h3>{{ device.name }}</h3>
          <p>{{ device.ip }}</p>
        </div>

        <span class="ui-chip">
          {{ device.group || 'Sem grupo' }}
        </span>
      </div>

      <div
        class="device-list__status"
        :class="device.online ? 'device-list__status--online' : 'device-list__status--offline'"
      >
        <span class="device-list__status-dot" />
        <span>
          {{ device.online ? 'Online' : `Offline ${timeAgo(device.offlineSince)}` }}
        </span>
      </div>
    </article>
  </div>
</template>

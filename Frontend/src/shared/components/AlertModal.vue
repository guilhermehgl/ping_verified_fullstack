<script setup>
defineProps({
  devices: { type: Array, required: true }
})

defineEmits(['ack'])

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`

  return `há ${Math.floor(hours / 24)} dias`
}
</script>

<template>
  <div class="offline-alert">
    <div class="offline-alert__card">
      <div class="offline-alert__header">
        <p class="offline-alert__eyebrow">Alerta</p>
        <h2>Dispositivos offline</h2>
      </div>

      <ul class="offline-alert__list">
        <li
          v-for="device in devices"
          :key="device.id"
          class="offline-alert__item"
        >
          <strong>{{ device.name }}</strong>
          <span>Offline {{ timeAgo(device.offlineSince) }}</span>
        </li>
      </ul>

      <button class="offline-alert__button" @click="$emit('ack')">
        Entendi
      </button>
    </div>
  </div>
</template>

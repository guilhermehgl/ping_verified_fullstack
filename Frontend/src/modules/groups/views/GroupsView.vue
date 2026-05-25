<script setup>
import { computed } from 'vue'
import DeviceForm from '../../devices/components/DeviceForm.vue'
import DeviceGroups from '../../devices/components/DeviceGroups.vue'

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
})

defineEmits(['added', 'changed'])

const groupCount = computed(() => {
  return new Set(props.devices.map(device => device.group || 'Sem grupo')).size
})
</script>

<template>
  <section class="groups-page">
    <header class="groups-page__header">
      <div class="groups-page__title-block">
        <p class="groups-page__eyebrow">Organização</p>
        <h2>Grupos</h2>
      </div>

      <div class="groups-page__chips">
        <span class="ui-chip">{{ groupCount }} grupos</span>
        <span class="ui-chip">{{ devices.length }} dispositivos</span>
      </div>
    </header>

    <div class="groups-page__layout">
      <DeviceForm :devices="devices" @added="$emit('added')" />
      <DeviceGroups :devices="devices" @changed="$emit('changed')" />
    </div>
  </section>
</template>


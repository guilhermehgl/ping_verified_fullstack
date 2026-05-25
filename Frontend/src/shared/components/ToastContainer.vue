<script setup>
defineProps({
  alerts: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div class="toast-stack">
    <div
      v-for="alert in alerts"
      :key="alert.id"
      :class="['toast-stack__item', `toast-stack__item--${alert.type}`]"
    >
      {{ alert.message }}
    </div>
  </div>
</template>

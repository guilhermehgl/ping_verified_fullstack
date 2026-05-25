<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'Recarregando dados...'
  }
})
</script>

<template>
  <div v-if="visible" class="loading-screen">
    <div class="loading-screen__card">
      <div class="loading-screen__spinner" />
      <p>{{ message }}</p>
    </div>
  </div>
</template>

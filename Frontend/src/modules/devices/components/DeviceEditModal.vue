<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  device: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

const form = reactive({
  name: '',
  ip: ''
})

watch(
  () => props.device,
  (device) => {
    form.name = device?.name || ''
    form.ip = device?.ip || ''
  },
  { immediate: true }
)

const confirmLabel = computed(() => {
  return props.index === props.total - 1 ? 'Salvar' : 'Salvar e continuar'
})

function submit() {
  emit('save', {
    name: form.name.trim(),
    ip: form.ip.trim()
  })
}
</script>

<template>
  <div class="device-edit-modal">
    <div class="device-edit-modal__card">
      <div class="device-edit-modal__header">
        <div>
          <p class="device-edit-modal__progress">
            {{ index + 1 }} de {{ total }}
          </p>
          <h2>Editar dispositivo</h2>
        </div>

        <button
          type="button"
          class="device-edit-modal__ghost-button"
          :disabled="loading"
          @click="$emit('close')"
        >
          Fechar
        </button>
      </div>

      <div class="device-edit-modal__group">
        <strong>{{ device.group || 'Sem grupo' }}</strong>
      </div>

      <form class="device-edit-modal__form" @submit.prevent="submit">
        <label class="device-edit-modal__field">
          <span>Nome</span>
          <input
            v-model="form.name"
            class="device-edit-modal__control"
            :disabled="loading"
            placeholder="Nome do dispositivo"
          />
        </label>

        <label class="device-edit-modal__field">
          <span>IP ou hostname</span>
          <input
            v-model="form.ip"
            class="device-edit-modal__control"
            :disabled="loading"
            placeholder="IP ou hostname"
          />
        </label>

        <p v-if="errorMessage" class="device-edit-modal__error">
          {{ errorMessage }}
        </p>

        <div class="device-edit-modal__actions">
          <button
            type="button"
            class="device-edit-modal__secondary-button"
            :disabled="loading"
            @click="$emit('close')"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="device-edit-modal__primary-button"
            :disabled="loading"
          >
            {{ loading ? 'Salvando...' : confirmLabel }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { api } from '../services/api.js'

const emit = defineEmits(['added'])

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
})

const name = ref('')
const ip = ref('')
const selectedGroup = ref('')
const newGroup = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const groups = computed(() => {
  return [...new Set(props.devices.map(device => device.group).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
})

const canSubmit = computed(() => {
  return Boolean(name.value.trim() && ip.value.trim())
})

async function submit() {
  if (!canSubmit.value || isSubmitting.value) return

  const groupToSend = newGroup.value.trim() || selectedGroup.value || 'Sem grupo'

  try {
    isSubmitting.value = true
    errorMessage.value = ''

    await api.post('/devices', {
      name: name.value.trim(),
      ip: ip.value.trim(),
      group: groupToSend
    })

    name.value = ''
    ip.value = ''
    newGroup.value = ''
    selectedGroup.value = groupToSend

    emit('added')
  } catch (err) {
    console.error('Erro ao adicionar dispositivo:', err)
    errorMessage.value = err.response?.data?.error || 'Erro ao adicionar dispositivo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="device-form ui-surface">
    <div class="device-form__header">
      <p class="device-form__eyebrow">Cadastro</p>
      <h3>Adicionar dispositivo</h3>
    </div>

    <form class="device-form__grid" @submit.prevent="submit">
      <label class="device-form__field">
        <span class="device-form__label">Nome</span>
        <input
          v-model="name"
          class="device-form__control"
          :disabled="isSubmitting"
          placeholder="Ex.: Impressora Fiscal"
        />
      </label>

      <label class="device-form__field">
        <span class="device-form__label">IP ou hostname</span>
        <input
          v-model="ip"
          class="device-form__control"
          :disabled="isSubmitting"
          placeholder="Ex.: 192.168.0.10"
        />
      </label>

      <label class="device-form__field">
        <span class="device-form__label">Grupo existente</span>
        <select
          v-model="selectedGroup"
          class="device-form__control"
          :disabled="isSubmitting"
        >
          <option value="">Selecione um grupo</option>
          <option
            v-for="group in groups"
            :key="group"
            :value="group"
          >
            {{ group }}
          </option>
        </select>
      </label>

      <label class="device-form__field">
        <span class="device-form__label">Novo grupo</span>
        <input
          v-model="newGroup"
          class="device-form__control"
          :disabled="isSubmitting"
          placeholder="Ex.: Impressoras"
        />
      </label>

      <button
        type="submit"
        :disabled="!canSubmit || isSubmitting"
        class="device-form__submit"
      >
        {{ isSubmitting ? 'Adicionando...' : 'Adicionar dispositivo' }}
      </button>
    </form>

    <p v-if="errorMessage" class="device-form__error">
      {{ errorMessage }}
    </p>
  </section>
</template>


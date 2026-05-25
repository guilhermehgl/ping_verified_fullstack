<script setup>
import { computed, reactive, ref, watchEffect } from 'vue'
import { api } from '../services/api.js'
import DeviceEditModal from './DeviceEditModal.vue'

const props = defineProps({
  devices: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['changed'])

const expandedGroups = reactive({})

const actionMode = ref('')
const actionGroupName = ref('')
const selectedDeviceIds = ref([])
const actionError = ref('')
const loadingGroupName = ref('')

const editQueue = ref([])
const editIndex = ref(0)
const editError = ref('')
const isSavingEdit = ref(false)

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

const groupedDevices = computed(() => {
  const groups = props.devices.reduce((map, device) => {
    const groupName = device.group || 'Sem grupo'

    if (!map.has(groupName)) {
      map.set(groupName, [])
    }

    map.get(groupName).push(device)
    return map
  }, new Map())

  return [...groups.entries()]
    .map(([name, devices]) => ({
      name,
      devices: [...devices].sort((a, b) => {
        return Number(a.online) - Number(b.online) || a.name.localeCompare(b.name, 'pt-BR')
      }),
      offlineCount: devices.filter(device => !device.online).length
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
})

const currentEditDevice = computed(() => editQueue.value[editIndex.value] || null)

watchEffect(() => {
  // Grupos novos sempre nascem recolhidos e seleções inválidas somem após recarga/exclusão.
  groupedDevices.value.forEach(group => {
    if (!(group.name in expandedGroups)) {
      expandedGroups[group.name] = false
    }
  })

  const availableIds = new Set(props.devices.map(device => Number(device.id)))
  selectedDeviceIds.value = selectedDeviceIds.value.filter((id) => availableIds.has(Number(id)))
})

function toggleGroup(name) {
  if (actionGroupName.value === name) {
    cancelSelection()
  }

  expandedGroups[name] = !expandedGroups[name]
  actionError.value = ''
}

function statusLabel(device) {
  return device.online
    ? 'Online'
    : `Offline ${timeAgo(device.offlineSince)}`
}

function startSelection(groupName, mode) {
  // Evita concorrência entre exclusão em lote e a fila de edição sequencial.
  if (loadingGroupName.value || currentEditDevice.value) return

  expandedGroups[groupName] = true
  actionMode.value = mode
  actionGroupName.value = groupName
  selectedDeviceIds.value = []
  actionError.value = ''
}

function cancelSelection() {
  actionMode.value = ''
  actionGroupName.value = ''
  selectedDeviceIds.value = []
  actionError.value = ''
}

function isSelectingGroup(groupName) {
  return actionGroupName.value === groupName && Boolean(actionMode.value)
}

function isSelected(deviceId) {
  return selectedDeviceIds.value.includes(Number(deviceId))
}

function toggleSelection(deviceId) {
  const normalizedId = Number(deviceId)

  if (isSelected(normalizedId)) {
    selectedDeviceIds.value = selectedDeviceIds.value.filter((id) => id !== normalizedId)
    return
  }

  selectedDeviceIds.value = [...selectedDeviceIds.value, normalizedId]
}

function getSelectedDevices(group) {
  const selectedIds = new Set(selectedDeviceIds.value)
  return group.devices.filter((device) => selectedIds.has(Number(device.id)))
}

async function confirmSelection(group) {
  const devicesToProcess = getSelectedDevices(group)

  if (!devicesToProcess.length) {
    actionError.value = 'Selecione ao menos um dispositivo.'
    return
  }

  if (actionMode.value === 'delete') {
    await deleteSelectedDevices(group, devicesToProcess)
    return
  }

  // Congela os dados selecionados para a sequência de modais não depender da ordenação da lista.
  editQueue.value = devicesToProcess.map((device) => ({ ...device }))
  editIndex.value = 0
  editError.value = ''
  cancelSelection()
}

async function deleteSelectedDevices(group, devicesToDelete) {
  try {
    loadingGroupName.value = group.name
    actionError.value = ''

    await api.post('/devices/bulk-delete', {
      ids: devicesToDelete.map((device) => device.id)
    })

    cancelSelection()
    emit('changed')
  } catch (err) {
    console.error('Erro ao remover dispositivos:', err)
    actionError.value = err.response?.data?.error || 'Erro ao remover dispositivos.'
  } finally {
    loadingGroupName.value = ''
  }
}

function closeEditModal(force = false) {
  if (isSavingEdit.value && !force) return

  editQueue.value = []
  editIndex.value = 0
  editError.value = ''
}

async function saveCurrentDevice(payload) {
  if (!currentEditDevice.value || isSavingEdit.value) return

  if (!payload.name || !payload.ip) {
    editError.value = 'Nome e IP são obrigatórios.'
    return
  }

  try {
    isSavingEdit.value = true
    editError.value = ''

    await api.put(`/devices/${currentEditDevice.value.id}`, payload)

    if (editIndex.value >= editQueue.value.length - 1) {
      // Fecha a modal antes do refresh para não deixar o último item preso em tela.
      closeEditModal(true)
      emit('changed')
      return
    }

    editIndex.value += 1
    editError.value = ''
  } catch (err) {
    console.error('Erro ao editar dispositivo:', err)
    editError.value = err.response?.data?.error || 'Erro ao editar dispositivo.'
  } finally {
    isSavingEdit.value = false
  }
}

function isBusy(groupName) {
  return loadingGroupName.value === groupName
}

function selectionTitle() {
  return actionMode.value === 'delete'
    ? 'Selecione os dispositivos para excluir'
    : 'Selecione os dispositivos para editar'
}

function confirmLabel() {
  return actionMode.value === 'delete' ? 'Confirmar exclusão' : 'Iniciar edição'
}
</script>

<template>
  <section class="device-groups ui-surface">
    <div class="device-groups__header">
      <div>
        <p class="device-groups__eyebrow">Operações em lote</p>
        <h3>Grupos</h3>
      </div>
    </div>

    <div v-if="groupedDevices.length" class="device-groups__list">
      <article
        v-for="group in groupedDevices"
        :key="group.name"
        class="device-groups__group"
      >
        <button
          type="button"
          class="device-groups__toggle"
          @click="toggleGroup(group.name)"
        >
          <div class="device-groups__toggle-main">
            <strong>{{ group.name }}</strong>
            <span>{{ group.devices.length }} dispositivos</span>
          </div>

          <div class="device-groups__toggle-meta">
            <span
              v-if="group.offlineCount"
              class="ui-chip ui-chip--danger"
            >
              {{ group.offlineCount }} offline
            </span>
            <span class="ui-chip">
              {{ expandedGroups[group.name] ? 'Ocultar' : 'Abrir' }}
            </span>
          </div>
        </button>

        <div
          v-if="expandedGroups[group.name]"
          class="device-groups__body"
        >
          <article
            v-for="device in group.devices"
            :key="device.id"
            class="device-groups__device"
            :class="{ 'device-groups__device--selecting': isSelectingGroup(group.name) }"
          >
            <label
              v-if="isSelectingGroup(group.name)"
              class="device-groups__checkbox"
            >
              <input
                type="checkbox"
                :checked="isSelected(device.id)"
                @change="toggleSelection(device.id)"
              />
              <span>Selecionar</span>
            </label>

            <div class="device-groups__device-content">
              <div>
                <h4>{{ device.name }}</h4>
                <p>{{ device.ip }}</p>
              </div>

              <span
                class="device-groups__status"
                :class="device.online ? 'device-groups__status--online' : 'device-groups__status--offline'"
              >
                {{ statusLabel(device) }}
              </span>
            </div>
          </article>

          <div
            v-if="isSelectingGroup(group.name)"
            class="device-groups__selection"
          >
            <div>
              <p class="device-groups__selection-title">
                {{ selectionTitle() }}
              </p>
              <p class="device-groups__selection-count">
                {{ selectedDeviceIds.length }} selecionado(s)
              </p>
            </div>

            <div class="device-groups__selection-actions">
              <button
                type="button"
                class="device-groups__selection-button device-groups__selection-button--ghost"
                :disabled="isBusy(group.name)"
                @click="cancelSelection"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="device-groups__selection-button"
                :disabled="isBusy(group.name) || !selectedDeviceIds.length"
                @click="confirmSelection(group)"
              >
                {{ isBusy(group.name) ? 'Processando...' : confirmLabel() }}
              </button>
            </div>
          </div>

          <div
            v-else
            class="device-groups__actions"
          >
            <button
              type="button"
              class="device-groups__icon-button"
              title="Editar dispositivos"
              aria-label="Editar dispositivos"
              :disabled="loadingGroupName || currentEditDevice"
              @click="startSelection(group.name, 'edit')"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3zM14.5 6.5l3 3"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
              </svg>
            </button>

            <button
              type="button"
              class="device-groups__icon-button device-groups__icon-button--danger"
              title="Excluir dispositivos"
              aria-label="Excluir dispositivos"
              :disabled="loadingGroupName || currentEditDevice"
              @click="startSelection(group.name, 'delete')"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M4 7h16M9 7V5h6v2m-7 0 1 12h6l1-12"
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                />
              </svg>
            </button>
          </div>

          <p
            v-if="actionError && actionGroupName === group.name"
            class="device-groups__error"
          >
            {{ actionError }}
          </p>
        </div>
      </article>
    </div>

    <p v-else class="ui-empty-state">
      Nenhum grupo cadastrado ainda.
    </p>

    <DeviceEditModal
      v-if="currentEditDevice"
      :device="currentEditDevice"
      :index="editIndex"
      :total="editQueue.length"
      :loading="isSavingEdit"
      :error-message="editError"
      @close="closeEditModal"
      @save="saveCurrentDevice"
    />
  </section>
</template>


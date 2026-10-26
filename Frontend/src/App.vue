<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDevicesStore } from './modules/devices/store/devices.store'
import { useAlerts } from './modules/alerts/composables/useAlerts'
import { isDemo } from './shared/api/mode'

import Dashboard from './modules/dashboard/views/DashboardView.vue'
import GroupsPage from './modules/groups/views/GroupsView.vue'
import ToastContainer from './shared/components/ToastContainer.vue'
import AlertModal from './shared/components/AlertModal.vue'
import LoadingScreen from './shared/components/LoadingScreen.vue'

const store = useDevicesStore()
const currentPage = ref(getPageFromHash())
let pollingId = null

function getPageFromHash() {
  const hash = window.location.hash.replace('#', '')
  return hash === 'groups' ? 'groups' : 'dashboard'
}

function navigateTo(page) {
  currentPage.value = page
  window.location.hash = page
}

function handleHashChange() {
  currentPage.value = getPageFromHash()
}

function requestNotificationPermission() {
  if (!isDemo && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

async function pollWithVisibility() {
  if (!document.hidden) {
    await store.loadDevices(false)
  }
}

const { alerts, acknowledgeAll, unacknowledgedOffline } = useAlerts(computed(() => store.items), { simulated: isDemo })

onMounted(async () => {
  if (!window.location.hash) window.location.hash = 'dashboard'
  await store.loadDevices(true)
  if (!isDemo) pollingId = window.setInterval(pollWithVisibility, 5000)
  window.addEventListener('hashchange', handleHashChange)
  requestNotificationPermission()
})

onBeforeUnmount(() => {
  if (pollingId) window.clearInterval(pollingId)
  window.removeEventListener('hashchange', handleHashChange)
})
</script>

<template>
  <div class="app-shell">
    <header class="app-header ui-surface">
      <div class="app-header__brand">
        <p class="app-header__eyebrow">
          Verificador de Ping
        </p><h1>Monitoramento</h1>
      </div>
      <div class="app-header__meta">
        <div class="app-header__chips">
          <span class="ui-chip ui-chip--danger">{{ store.offlineCount }} offline</span><span class="ui-chip">{{ store.items.length }} dispositivos</span>
        </div>
        <nav
          class="app-nav"
          aria-label="Paginas"
        >
          <button
            type="button"
            class="app-nav__button"
            :class="{ 'app-nav__button--active': currentPage === 'dashboard' }"
            @click="navigateTo('dashboard')"
          >
            Dashboard
          </button>
          <button
            type="button"
            class="app-nav__button"
            :class="{ 'app-nav__button--active': currentPage === 'groups' }"
            @click="navigateTo('groups')"
          >
            Grupos
          </button>
        </nav>
      </div>
    </header>
    <p
      v-if="isDemo"
      class="app-demo-note"
    >
      Demonstração simulada — nenhum dispositivo real está sendo monitorado. Os dados ficam em memória; recarregar restaura os exemplos.
    </p>
    <main class="app-content">
      <section
        v-if="store.lastError"
        class="ui-surface app-feedback"
        role="alert"
      >
        <p>{{ store.lastError }}. Os dados exibidos podem estar desatualizados.</p>
        <button
          type="button"
          :disabled="store.isLoading"
          @click="store.loadDevices(true)"
        >
          Tentar novamente
        </button>
      </section>
      <p
        v-else-if="!store.hasLoaded && store.isLoading"
        role="status"
      >
        Carregando dispositivos...
      </p>
      <template v-if="store.hasLoaded">
        <Dashboard
          v-if="currentPage === 'dashboard'"
          :devices="store.items"
          :simulated="isDemo"
        />
        <GroupsPage
          v-else
          :devices="store.items"
          @added="store.loadDevices(true)"
          @changed="store.loadDevices(true)"
        />
      </template>
    </main>
    <ToastContainer :alerts="alerts" />
    <AlertModal
      v-if="unacknowledgedOffline.length"
      :devices="unacknowledgedOffline"
      @ack="acknowledgeAll"
    />
    <LoadingScreen
      :visible="store.isReloadingPage"
      message="Recarregando pagina..."
    />
  </div>
</template>

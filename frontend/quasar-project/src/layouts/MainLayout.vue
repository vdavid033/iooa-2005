<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
  <div class="q-toolbar-title" style="display: flex; justify-content: center;">
    <q-btn flat label="Početna" to="/" />
    <q-btn flat label="Datoteke" to="/folders" />
    <q-btn flat label="Poruke" to="/poruke" />
    <q-btn flat label="Forum" to="/forum" />
    <q-btn flat label="Obaveze" to="/kalendar-obaveze">
      <q-tooltip>Kalendar</q-tooltip>
    </q-btn>
    <q-btn flat label="Dogadaji" to="/kalendardog">
      <q-tooltip>Kalendar</q-tooltip>
    </q-btn>
    <q-btn flat label="Grupne poruke" to="/groups">
    <q-tooltip>Grupne poruke</q-tooltip>
    </q-btn>
    <q-btn flat label="Registriraj se" to="/register" />
    <q-btn
  v-if="isAdmin"
  flat
  label="Admin Prijave"
  to="/admin/reports"
/>
  </div>

    <!-- Desna strana: Login / Logout -->
    <q-space />
      <q-btn
        v-if="!isAuthenticated"
        flat
        icon="login"
        label="Login"
        to="/login"
        />
      <q-btn
        v-else
        flat
        icon="logout"
        label="Logout"
        @click="logout"
        />
</q-toolbar>

        <div v-if="isLoggedIn" class="q-mr-sm text-white">
          {{ korisnickoIme }}
        </div>
     
    </q-header>

    <!--  Lijevi drawer sa linkovima i kontaktima 
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-1" :width="280">
      <q-scroll-area style="height: 100%;">
        <q-list>
          <q-item-label header>NAVIGACIJA</q-item-label>
          <q-item clickable v-ripple to="/poruke">
            <q-item-section avatar>
              <q-icon name="chat" />
            </q-item-section>
            <q-item-section>Poruke</q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/notifikacija">
  <q-item-section avatar>
    <q-icon name="notifications" />
  </q-item-section>
  <q-item-section>Notifikacija Dummy</q-item-section>
</q-item>

        </q-list>
      </q-scroll-area>
        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>
  -->
    <!-- Sadržaj stranice -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { jwtDecode } from "jwt-decode"
import { initNotificationService, stopNotificationService } from '../services/notificationService'

defineOptions({
  name: 'MainLayout'
})

const $q = useQuasar()
const router = useRouter()

// Vaš postojeći kod
const linksList = [
  // ... postojeće linkove
]

const isAdmin = computed(() => {
  const token = localStorage.getItem('token')
  if (!token) return false
  try {
    const decoded = jwtDecode(token)
    return decoded.uloga === 'admin' || decoded.uloga === 1
  } catch (e) {
    return false
  }
})

const leftDrawerOpen = ref(false)
const isLoggedIn = computed(() => !!localStorage.getItem('korisnik'))
const korisnickoIme = computed(() => {
  const korisnik = JSON.parse(localStorage.getItem('korisnik'))
  return korisnik?.korisnickoime || ''
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  // Zaustavi notifikacije prije odjave
  stopNotificationService()
  localStorage.removeItem('korisnik')
  localStorage.removeItem('token')
  localStorage.removeItem("token")
  sessionStorage.removeItem("alert_shown")
  router.push('/')
}

// Inicijalizacija notifikacija
onMounted(() => {
  const token = localStorage.getItem("token")
  if (token) {
    try {
      const decoded = jwtDecode(token)
      if (decoded && decoded.id) {
        initNotificationService($q, decoded.id)
      }
    } catch (error) {
      console.error("Greška pri dekodiranju tokena:", error)
    }
  }
})

// Čišćenje prije unmounta
onUnmounted(() => {
  stopNotificationService()
})
</script>
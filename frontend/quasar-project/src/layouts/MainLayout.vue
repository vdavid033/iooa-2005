<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>

        <div class="q-toolbar-title" style="display: flex; align-items: center; gap: 12px;">
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
          <q-btn v-if="!isAuthenticated()" flat label="Registriraj se" to="/register" />
        </div>

        <q-space />

        <div v-if="!isAuthenticated()" class="row items-center q-gutter-sm">
          <q-input
            v-model="name"
            placeholder="Korisnik"
            dense
            outlined
            hide-bottom-space
            style="width: 120px;"
            class="bg-white"
          />
          <q-input
            v-model="passwd"
            type="password"
            placeholder="Lozinka"
            dense
            outlined
            hide-bottom-space
            style="width: 120px;"
            class="bg-white"
          />
          <q-btn dense unelevated color="primary" @click="login">
            Login
          </q-btn>
        </div>

        <div v-else class="row items-center q-gutter-sm">
          <span class="text-white q-mr-sm">Korisnik: {{ user?.ime }}</span>
          <q-btn dense flat icon="logout" label="Logout" @click="logoutHandler" />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUser } from 'src/composables/useUser'

const { isAuthenticated, logout, loadUserFromToken, user } = useUser()
const router = useRouter()

const name = ref('')
const passwd = ref('')

onMounted(() => {
  loadUserFromToken()
})

async function login() {
  try {
    const { data } = await axios.post('http://localhost:3000/api/login', {
      username: name.value,
      password: passwd.value,
    })

    if (data.token) {
      localStorage.setItem('token', data.token)
      await loadUserFromToken()
      // Očisti polja forme
      name.value = ''
      passwd.value = ''
      // (Opcionalno) redirect, npr. na početnu
      // router.push('/')
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message)
  }
}

// Metoda za logout (zove se kod klika na gumb “Logout”)
function logoutHandler() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
/* Ako želiš ispraviti boju pozadine inputa da bude svijetla unutar toolbar plave podloge */
.q-input__control {
  background: white;
}
</style>

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
          <q-btn v-if="!isAuthenticated()" flat label="Registriraj se" to="/register" />
        </div>

        <!-- Desna strana: Login / Logout -->
        <q-space />
        <q-btn
          v-if="!isAuthenticated()"
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

    <!-- Sadržaj stranice -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUser } from 'src/composables/useUser'  // Uvoz useUser composable-a

const router = useRouter()

// Inicijalizacija korisničkog objekta iz useUser composable-a
const { isAuthenticated, logout, loadUserFromToken, user } = useUser()

// Pozivamo loadUserFromToken kako bi učitali korisnika kada se stranica učita
onMounted(() => {
  loadUserFromToken()
})

// Logout funkcija
function logoutHandler() {
  logout()
  router.push('/login')
}
</script>

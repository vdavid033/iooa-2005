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
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
defineOptions({
  name: 'MainLayout'
})

const linksList = [
  {
    title: 'Datoteke',
    caption: 'Dijeljenje datoteka',
    icon: 'folder',
    to: '/folders',
  },
  {
    title: 'Grupne poruke',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'http://localhost:9000/groups/',
  },
  {
    title: 'Forum',
    caption: 'forum.quasar.dev',
    icon: 'record_voice_over',
    link: 'https://forum.quasar.dev',
  },
  {
    title: 'Twitter',
    caption: '@quasarframework',
    icon: 'rss_feed',
    link: 'https://twitter.quasar.dev',
  },
  {
    title: 'Poruke',
    caption: '',
    icon: 'poruke',
    link: '/Poruke',
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const router = useRouter()

const isLoggedIn = computed(() => {
  return !!localStorage.getItem('korisnik')
})

const korisnickoIme = computed(() => {
  const korisnik = JSON.parse(localStorage.getItem('korisnik'))
  return korisnik?.korisnickoime || ''
})

function logout() {
  localStorage.removeItem('korisnik')
  router.push('/')
}

</script>

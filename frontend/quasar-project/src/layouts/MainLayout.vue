<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
<<<<<<< HEAD
  <div class="q-toolbar-title" style="display: flex; justify-content: center;">
    <q-btn flat label="Početna" to="/" />
    <q-btn flat label="Poruke" to="/poruke" />
    <q-btn flat label="Forum" to="/forum" />
    <q-btn flat label="Obaveze" to="/kalendar-obaveze">
      <q-tooltip>Kalendar</q-tooltip>
    </q-btn>
    <q-btn flat label="Dogadaji" to="/kalendardog">
      <q-tooltip>Kalendar</q-tooltip>
    </q-btn>
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
=======
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> PORUKE</q-toolbar-title>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <div class="q-toolbar-title">
          <q-btn flat label="Početna" to="/" />
          <q-btn flat label="Datoteke" to="/folders">
            <q-tooltip>Datoteke</q-tooltip>
          </q-btn>
          <q-btn flat label="Forum" to="/forum" />
          <q-btn flat label="Obaveze" to="/kalendar-obaveze">
            <q-tooltip>Kalendar</q-tooltip>
          </q-btn>
          <q-btn flat label="Dogadaji" to="/kalendardog">
            <q-tooltip>Kalendar</q-tooltip>
          </q-btn>
        </div>
        <q-toolbar-title> Quasar App</q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Essential Links</q-item-label>
>>>>>>> development

        </q-list>
      </q-scroll-area>
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

defineOptions({
  name: 'MainLayout'
})

<<<<<<< HEAD
=======
const linksList = [
  {
    title: 'Docs',
    caption: 'quasar.dev',
    icon: 'school',
    link: 'https://quasar.dev',
  },
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
  },

  {
    title: 'Notifikacija Dummy',
    caption: '',
    icon: 'notifications',
    link: '/notifikacija',
  },
  {
    title: 'Inbox Poruke',
    caption: '',
    icon: 'email',
    link: '/inbox',
  },
]

>>>>>>> development
const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

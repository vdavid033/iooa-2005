<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links</q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'

defineOptions({
  name: 'MainLayout',
})

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
    title: 'Discord Chat Channel',
    caption: 'chat.quasar.dev',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
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

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

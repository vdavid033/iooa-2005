<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <div class="q-toolbar-title">
          <q-btn flat label="Početna" to="/" />
          <q-btn flat label="Forum" to="/Forum" />
          <q-btn flat label="Obaveze" to="/kalendar-obaveze"><q-tooltip>Kalendar</q-tooltip></q-btn>
        </div>
        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

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
    title: 'VeleRi',
    caption: 'veleri',
    icon: 'school',
    link: 'https://veleri.hr',
  },
  {
    title: 'Forum',
    caption: 'forum',
    icon: 'code',
    link: 'https://github.com/quasarframework',
  },
  {
    title: 'Dijeljenje dokumenata',
    caption: 'Dijeljenje dokumenata',
    icon: 'chat',
    link: 'https://chat.quasar.dev',
  },
  {
    title: 'Poruke',
    caption: 'poruke',
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
    title: 'Kalendar rokova',
    caption: 'kalendar rokova',
    icon: 'public',
    link: 'https://facebook.quasar.dev',
  },
  {
    title: 'Kreiranje grupa',
    caption: 'kreiranje grupa',
    icon: 'favorite',
    link: 'https://awesome.quasar.dev',
  },
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

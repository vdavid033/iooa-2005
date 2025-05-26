<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          PORUKE
        </q-toolbar-title>

<div class="q-toolbar-title">
  <q-btn flat label="Početna" to="/" />
  <q-btn flat label="Forum" to="/forum" />
  <q-btn flat label="Obaveze" to="/kalendar-obaveze">
    <template v-slot:tooltip>Kalendar</template>
  </q-btn>
  <q-btn flat label="Događaji" to="/kalendardog">
    <template v-slot:tooltip>Kalendar</template>
  </q-btn>

  <template v-if="!isLoggedIn">
    <q-btn flat label="Login" to="/login" />
    <q-btn flat label="Register" to="/register" />
  </template>
  <q-btn
    v-else
    flat
    label="Logout"
    @click="logout"
  />
</div>
  <q-space />

        <div v-if="isLoggedIn" class="q-mr-sm text-white">
          {{ korisnickoIme }}
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>
          Essential Links
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
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
import { computed } from 'vue'
import { useRouter } from 'vue-router'
defineOptions({
  name: 'MainLayout',
})

const linksList = [
{
    title: 'Poruke',
    caption: '',
    icon: 'poruke',
    link: '/Poruke'
  },

  {
    title: 'Notifikacija Dummy',
    caption: '',
    icon: 'notifications',
    link: '/notifikacija'
  },
  {
    title: 'Inbox Poruke',
    caption: '',
    icon: 'email',
    link: '/inbox'
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

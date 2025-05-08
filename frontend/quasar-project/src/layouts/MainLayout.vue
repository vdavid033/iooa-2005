<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
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

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

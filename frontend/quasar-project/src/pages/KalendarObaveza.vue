<template>
  <q-page class="q-pa-md">
    <!-- Gumb za otvaranje popupa za unos obaveze -->
    <q-btn
      @click="
        showUnos = true
        showDetalji = false
      "
      label="Unesi novu obavezu"
      color="primary"
    />

    <q-btn
      @click="toggleDetalji"
      label="Prikaži detalje obaveze"
      color="secondary"
      class="q-ml-md"
    />

    <q-dialog v-model="showUnos">
      <q-card style="max-width: 30%; width: 100%">
        <q-card-section>
          <UnosObaveze />
        </q-card-section>
        <q-card-actions>
          <q-btn @click="toggleUnos" label="Zatvori" color="secondary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDetalji">
      <q-card>
        <q-card-section>
          <DetaljiObaveze />
        </q-card-section>
        <q-card-actions>
          <q-btn @click="toggleDetalji" label="Zatvori" color="secondary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import KalendarObaveza from 'src/components/KalendarObaveza.vue'
import UnosObaveze from 'src/components/UnosObaveze.vue'
import DetaljiObaveze from 'src/components/DetaljiObaveze.vue'

const showUnos = ref(false)
const showDetalji = ref(false)
</script>

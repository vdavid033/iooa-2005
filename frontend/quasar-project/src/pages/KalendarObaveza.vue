<template>
  <q-page class="q-pa-md">
    <KalendarObaveza @klikNaObavezu="prikaziDetaljeObaveze" />

    <!-- Gumb za otvaranje popupa za unos obaveze -->
    <q-btn @click="showUnos = true; showDetalji = false" label="Unesi novu obavezu" color="primary" />

    <!-- Gumb za otvaranje popupa za detalje obaveze -->
    <q-btn @click="showDetalji = true; showUnos = false" label="Prikaži detalje obaveze" color="secondary" class="q-ml-md" />

    <!-- Popup za unos obaveze -->
    <q-dialog v-model="showUnos">
      <q-card style="max-width: 30%; width:100%">
        <q-card-section>
          <UnosObaveze />
        </q-card-section>
        <q-card-actions>
          <q-btn @click="showUnos = false" label="Zatvori" color="secondary" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Popup za detalje obaveze -->
    <q-dialog v-model="showDetalji">
      <q-card>
        <q-card-section>
          <DetaljiObaveze />
        </q-card-section>
        <q-card-actions>
          <q-btn @click="showDetalji = false" label="Zatvori" color="secondary" />
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
const selektiranaObaveza = ref(null)

function prikaziDetaljeObaveze(obaveza) {
  console.log('Primio obavezu:', obaveza)
  selektiranaObaveza.value = obaveza
  showDetalji.value = true
}
</script>

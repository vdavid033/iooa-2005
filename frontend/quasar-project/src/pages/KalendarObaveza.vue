<template>
  <q-page class="q-pa-xl">

    <KalendarObaveza @klikNaObavezu="prikaziDetaljeObaveze"/>

    <q-btn
  v-if="isAdmin()"
  @click="toggleUnos"
  label="Unesi novu obavezu"
  color="primary"
  class="q-mt-md"
/>

<q-dialog v-model="showUnos" v-if="isAdmin()">
  <q-card style="max-width: 30%; width: 100%">
    <q-card-section>
      <UnosObaveze />
    </q-card-section>
    <q-card-actions>
      <q-btn @click="showUnos = false" label="Zatvori" color="secondary" class="q-ma-md" />
    </q-card-actions>
  </q-card>
</q-dialog>

    <q-dialog v-model="showUnos">
      <q-card style="max-width: 30%; width: 100%">
        <q-card-section>
          <UnosObaveze />
        </q-card-section>
        <q-card-actions>
          <q-btn @click="showUnos = false" label="Zatvori" color="secondary" class="q-ma-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDetalji">
      <q-card>
        <q-card-section>
          <DetaljiObaveze :datum="selektiranDatum" :obaveze="selektiraneObaveze" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn @click="showDetalji = false" label="Zatvori" color="secondary" class="q-ma-md" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import KalendarObaveza from 'src/components/KalendarObaveza.vue'
import UnosObaveze from 'src/components/UnosObaveze.vue'
import DetaljiObaveze from 'src/components/DetaljiObaveze.vue'
import { useUser } from 'src/composables/useUser'
const { isAdmin, loadUserFromToken } = useUser()
loadUserFromToken()

const showUnos = ref(false)
const showDetalji = ref(false)

const toggleUnos = () => {
  showUnos.value = !showUnos.value
}
const selektiranDatum = ref('')
const selektiraneObaveze = ref(null)

async function dohvatiDetaljeObaveze(obaveza) {
  try {
    const token = localStorage.getItem('token')
    const url = isAdmin() 
      ? 'http://localhost:3000/api/obaveze' 
      : 'http://localhost:3000/api/obaveze-korisnik'

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const sveObaveze = response.data

    const obavezeZaDatum = sveObaveze.filter(ob => ob.datum_obaveze === obaveza.datum_obaveze)
    return obavezeZaDatum
  } catch (err) {
    console.error('Greška pri dohvaćanju detalja obaveze:', err)
    return []
  }
}

function prikaziDetaljeObaveze({ datum, obaveza }) {
  console.log('Detalji obaveze:', datum, obaveza)
  selektiranDatum.value = datum
  if (obaveza && obaveza.id_obaveze) {
    dohvatiDetaljeObaveze(obaveza).then((detalji) => {
      selektiraneObaveze.value = detalji
      showDetalji.value = true
    })
  } else {
    console.error('Obaveza nije ispravno definirana ili nema ID')
  }
}

async function prikaziObavezeZaDan(datum) {
  selektiranDatum.value = datum
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://localhost:3000/api/obavezaDetalji`, {
      params: { datum_obaveze: datum },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    selektiraneObaveze.value = response.data
    showDetalji.value = true
  } catch (err) {
    console.error('Greška pri dohvaćanju obaveza za dan:', err)
  }
}

</script>
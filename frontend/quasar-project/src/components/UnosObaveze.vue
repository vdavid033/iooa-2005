<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Unos obaveze</div>
      <q-form @submit.prevent="submitForm">
        console.log('Submit form pokrenut')

        <q-input v-model="naziv" label="Naziv obaveze" required />
        <q-input v-model="datum" label="Datum" type="date" required />
        <q-input v-model="vrijeme" label="Vrijeme" type="time" required />

        <q-select
          v-model="tipObaveze"
          :options="tipoviObaveza"
          label="Tip obaveze"
          emit-value
          map-options
          required
        />

        <q-input v-model="kolegij" label="Kolegij" required />
        <q-input v-model="dvorana" label="Dvorana" required />
        <q-input v-model="nastavnik" label="Nastavnik" required />

        <q-btn type="submit" label="Spremi" color="primary" class="q-mt-md" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const naziv = ref('')
const datum = ref('')
const vrijeme = ref('')
const tipObaveze = ref(null)
const kolegij = ref('')
const dvorana = ref('')
const nastavnik = ref('')
const tipoviObaveza = ref([])

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/tipoviObaveza')
    tipoviObaveza.value = response.data
  } catch (error) {
    console.error('Greška pri dohvaćanju tipova obaveza:', error)
  }
})

const submitForm = async () => {
  try {
    const payload = {
      datum_obaveze: datum.value,
      vrijeme_pocetka: vrijeme.value,
      opis_obaveze: naziv.value,
      lokacija: dvorana.value,
      profesor: nastavnik.value,
      kolegij: kolegij.value,
      fk_tip_obaveze: tipObaveze.value,
    }

    const response = await axios.post('http://localhost:3000/api/unosObaveze', payload)
    console.log('Obaveza unesena:', response.data)
    // Reset forma
    naziv.value = ''
    datum.value = ''
    vrijeme.value = ''
    tipObaveze.value = null
    kolegij.value = ''
    dvorana.value = ''
    nastavnik.value = ''
  } catch (error) {
    console.error('Greška pri unosu obaveze:', error)
  }
}
</script>

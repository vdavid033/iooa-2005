<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Unos obaveze</div>
      <q-form @submit="submitForm">
        <q-input v-model="naziv" label="Naziv obaveze" required />
        <q-input v-model="datum" label="Datum" type="date" required />
        <q-input v-model="vrijeme" label="Vrijeme" type="time" required />
        <q-select v-model="tipObaveze" :options="tipoviObaveza" label="Tip obaveze" required />
        <q-input v-model="kolegij" label="Kolegij" required />
        <q-input v-model="dvorana" label="Dvorana" required />
        <q-input v-model="nastavnik" label="Nastavnik" required />
        <q-input v-model="napomena" label="Napomena (opcionalno)" type="textarea" />
        <q-btn type="submit" label="Spremi" color="primary" class="q-mt-md" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref } from 'vue'

const naziv = ref('')
const datum = ref('')
const vrijeme = ref('')
const tipObaveze = ref('')
const kolegij = ref('')
const dvorana = ref('')
const nastavnik = ref('')
const napomena = ref('')
const tipoviObaveza = ref([
  { label: 'Kolokvij', value: 'kolokvij' },
  { label: 'Ispit', value: 'ispit' },
  { label: 'Predavanje', value: 'predavanje' },
])

const submitForm = () => {
  console.log({
    naziv: naziv.value,
    datum: datum.value,
    vrijeme: vrijeme.value,
    tipObaveze: tipObaveze.value,
    kolegij: kolegij.value,
    dvorana: dvorana.value,
    nastavnik: nastavnik.value,
    napomena: napomena.value,
  })
}
</script>

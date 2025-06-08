<template>
  <div>
    <div class="text-h6 q-mb-md text-center">Obaveze na dan {{ formatirajDatum(datum) }}</div>

    <div class="row q-col-gutter-md justify-center">
      <q-card
        v-for="(o, index) in sortiraneObaveze"
        :key="index"
        class="col-12 col-sm-6 col-md-4 q-ma-sm"
        style="padding: 16px; min-width: 250px"
      >
        <q-card-section>
          <div class="text-h6">Detalji</div>
          <div><strong>Kolegij:</strong> {{ o.kolegij }}</div>
          <div><strong>Nastavnik:</strong> {{ o.profesor }}</div>
          <div><strong>Datum:</strong> {{ formatirajDatum(o.datum_obaveze) }}</div>
          <div><strong>Vrijeme:</strong> {{ formatirajVrijeme(o.vrijeme_pocetka) }}</div>
          <div><strong>Dvorana:</strong> {{ o.lokacija }}</div>
          <div><strong>Tip:</strong> {{ o.opis_obaveze }}</div>
          <div><strong>Napomena:</strong> {{ o.opis_obaveze }}</div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  datum: String,
  obaveze: Array
})

defineOptions({
  name: 'DetaljiObaveze'
})

const sortiraneObaveze = computed(() => {
  return [...props.obaveze].sort((a, b) => a.vrijeme_pocetka.localeCompare(b.vrijeme_pocetka))
})

function formatirajDatum(isoDatum) {
  const datumObj = new Date(isoDatum)
  const godina = datumObj.getFullYear()
  const mjesec = String(datumObj.getMonth() + 1).padStart(2, '0')
  const dan = String(datumObj.getDate()).padStart(2, '0')

  return `${dan}.${mjesec}.${godina}.`
}

function formatirajVrijeme(vrijeme) {
  const vrijemeObj = new Date(`1970-01-01T${vrijeme}Z`)
  const sati = String(vrijemeObj.getHours()).padStart(2, '0')
  const minute = String(vrijemeObj.getMinutes()).padStart(2, '0')

  return `${sati}:${minute}`
}
</script>

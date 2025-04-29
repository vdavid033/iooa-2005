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
          <div><strong>Vrijeme:</strong> {{ o.vrijeme_pocetka }}</div>
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
  obaveze: Array,
})

defineOptions({
  name: 'DetaljiObaveze',
})

const sortiraneObaveze = computed(() => {
  return [...props.obaveze].sort()
})

function formatirajDatum(isoDatum) {
  const [godina, mjesec, dan] = isoDatum.split('-')
  return `${parseInt(dan)}.${parseInt(mjesec)}.${godina}.`
}
</script>

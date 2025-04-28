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
          <div><strong>Kolegij:</strong> Napredno programiranje</div>
          <div><strong>Nastavnik:</strong> dr. Ivan Ivić</div>
          <div><strong>Datum:</strong> 12.06.2025</div>
          <div><strong>Vrijeme:</strong> 14:00</div>
          <div><strong>Dvorana:</strong> D-201</div>
          <div><strong>Tip:</strong> Kolokvij</div>
          <div><strong>Napomena:</strong> Prvi kolokvij</div>
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

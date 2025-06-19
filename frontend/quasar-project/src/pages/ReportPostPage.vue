<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Prijavi objavu</div>
        <div class="text-subtitle2">Odaberite razlog prijave</div>
      </q-card-section>

      <q-card-section>
        <q-select
          v-model="razlog"
          label="Razlog"
          :options="razlozi"
          outlined
          dense
        />

        <q-input
          v-model="opis"
          label="Dodatni opis (nije obavezno)"
          type="textarea"
          outlined
          dense
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Pošalji prijavu" color="negative" @click="posaljiPrijavu" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const postId = route.params.postId
const razlog = ref('')
const opis = ref('')

// Hardcoded korisnik ID for now (if no auth) — replace with real one later
const korisnikId = 1

const razlozi = ['Spam', 'Uvredljiv sadržaj', 'Lažne informacije', 'Drugo']

async function posaljiPrijavu() {
  if (!razlog.value) {
    $q.notify({ type: 'warning', message: 'Morate odabrati razlog' })
    return
  }

  try {
    await axios.post('/api/reports', {
      ID_Objava: postId,
      ID_Korisnika: korisnikId,
      razlog_prijave: razlog.value,
      opis_prijave: opis.value
    })

    $q.notify({ type: 'positive', message: 'Prijava je poslana' })
    router.push('/forum') // or wherever the user should go after
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Greška pri slanju prijave' })
  }
}
</script>
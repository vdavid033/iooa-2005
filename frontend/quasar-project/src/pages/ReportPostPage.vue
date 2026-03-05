<template>
  <q-page class="q-pa-md">
    <q-card class="q-pa-md" flat bordered>
      <q-card-section>
        <div class="text-h6">Prijavi objavu</div>
        <div class="text-subtitle2">Molimo odaberite razlog prijave</div>
      </q-card-section>

      <q-card-section>
        <q-select
          v-model="razlog"
          label="Razlog prijave"
          :options="razlozi"
          outlined
          dense
          emit-value
          map-options
        />

        <q-input
          v-model="opis"
          label="Dodatni opis (opcionalno)"
          type="textarea"
          outlined
          dense
          class="q-mt-md"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Odustani" flat @click="router.back()" />
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
import { useUser } from 'src/composables/useUser'

const { user, loadUserFromToken } = useUser()
loadUserFromToken()

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const postId = route.params.postId
const razlog = ref('')
const opis = ref('')

const razlozi = [
  { label: 'Spam', value: 'Spam' },
  { label: 'Uvredljiv sadržaj', value: 'Uvredljiv sadržaj' },
  { label: 'Lažne informacije', value: 'Lažne informacije' },
  { label: 'Govori mržnje ili nasilje', value: 'Govori mržnje ili nasilje' },
  { label: 'Drugo', value: 'Drugo' }
]

async function posaljiPrijavu() {
  if (!razlog.value) {
    $q.notify({ type: 'warning', message: 'Molimo odaberite razlog prijave.' })
    return
  }

  if (!user.value?.id) {
    $q.notify({ type: 'negative', message: 'Morate biti prijavljeni za slanje prijave.' })
    return
  }

  try {
    await axios.post('http://localhost:3000/api/reports', {
      ID_Objava: postId,
      ID_Korisnika: user.value.id,
      razlog_prijave: razlog.value,
      opis_prijave: opis.value
    })

    $q.notify({ type: 'positive', message: 'Prijava je uspješno poslana.' })
    router.push('/forum')
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Greška pri slanju prijave.' })
  }
}
</script>

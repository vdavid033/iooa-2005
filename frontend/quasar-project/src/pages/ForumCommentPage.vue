<template>
  <q-page class="q-pa-md">
    <!-- Gumb za povratak -->
    <q-btn
      label="← Natrag na forum"
      color="primary"
      flat
      @click="goBack"
      class="q-mb-md"
    />

    <!-- Prikaz OBJAVE -->
    <q-card v-if="post" class="q-mb-md">
      <q-card-section>
        <div class="text-h5">{{ post.naslov }}</div>
        <div class="text-subtitle2 text-grey">
          Korisnik: {{ post.username || 'Nepoznat' }} | {{ post.kategorija }} | {{ formatDate(post.datum_objave) }}
        </div>
        <div class="q-mt-md" v-html="post.sadrzaj"></div>
        <div class="q-mt-sm">
          <span v-for="tag in post.tagovi" :key="tag" class="q-mr-sm text-blue">#{{ tag }}</span>
        </div>
      </q-card-section>

      <q-card-section class="row items-center q-gutter-xs">
        <q-btn
          flat
          dense
          icon="report_problem"
          label="Prijavi objavu"
          color="negative"
          @click="goToReport(post.id)"
        />
      </q-card-section>
    </q-card>

    <!-- Ako nema pronađene objave -->
    <div v-else class="text-h6 text-negative">
      Objava nije pronađena.
    </div>

    <!-- Komentari -->
    <comment-section />
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import CommentSection from 'components/CommentSection.vue'

const route = useRoute()
const router = useRouter()
const post = ref(null)

const goBack = () => {
  router.push('/forum')
}

const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleString('hr-HR')
}

function goToReport(postId) {
  router.push(`/report/${postId}`)
}

onMounted(async () => {
  const postId = route.params.id

  try {
    const response = await axios.get(`http://localhost:3000/api/objave/${postId}`)
    post.value = response.data
    console.log('📦 Podaci objave:', response.data)
  } catch (err) {
    console.error('❌ Greška pri dohvaćanju objave:', err)
  }
})
</script>

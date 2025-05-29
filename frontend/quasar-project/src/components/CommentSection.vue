<template>
  <div>
    <!-- Unos komentara -->
    <q-input
      v-model="newComment"
      filled
      type="textarea"
      label="Napiši komentar..."
      autogrow
      class="q-mb-sm"
    />
    <q-btn
      label="Objavi komentar"
      color="primary"
      @click="postComment"
      :disable="!newComment.trim()"
      class="q-mb-lg"
    />

  <!-- Prikaz komentara -->
<div v-if="comments.length">
  <div v-for="(comment, index) in comments" :key="index" class="q-mb-md">
    <q-card flat bordered class="q-pa-md bg-grey-1 rounded-borders shadow-1">
      <div class="row items-start q-gutter-sm">
        <!-- Avatar -->
        <q-avatar size="40px" color="primary" text-color="white">
          {{ getInitials(comment.username) }}
        </q-avatar>

        <!-- Tekst komentara -->
        <div class="col">
          <div class="row items-center justify-between no-wrap">
            <div class="text-weight-medium text-primary">
              {{ comment.username || ('Korisnik #' + comment.id_korisnika) }}
            </div>
            <div class="text-caption text-grey-7">{{ formatDate(comment.datum_komentara) }}</div>
          </div>

          <q-separator spaced class="q-mt-sm q-mb-sm" />

          <div class="text-body1 text-black">
            {{ comment.sadrzaj_komentara }}
          </div>
        </div>
      </div>
    </q-card>
  </div>
</div>

<div v-else class="text-grey q-mt-md">Još nema komentara.</div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const newComment = ref('')
const comments = ref([])
const route = useRoute()
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase()
}
// 🚀 Dohvat komentara iz baze
const fetchComments = async () => {
  try {
    const response = await axios.get(`http://localhost:3000/api/comments/${route.params.id}`)
    comments.value = response.data
    console.log('✅ Komentari dohvaćeni:', comments.value)
  } catch (err) {
    console.error('❌ Greška pri dohvaćanju komentara:', err)
  }
}

// 📨 Slanje komentara u bazu
const postComment = async () => {
  if (!newComment.value.trim()) return

  const token = localStorage.getItem('token')
  if (!token) {
    alert('Nisi prijavljen. Prijavi se prije komentiranja.')
    return
  }

  const id_objava = parseInt(route.params.id)

  try {
    await axios.post(
      'http://localhost:3000/api/comments',
      {
        id_objava,
        sadrzaj_komentara: newComment.value
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    newComment.value = ''
    await fetchComments()
  } catch (err) {
    console.error('❌ Greška prilikom slanja komentara:', err)
  }
}

// Pozovi automatski kad se komponenta učita
onMounted(() => {
  fetchComments()
})

// Formatiranje datuma
const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleString('hr-HR')
}
</script>

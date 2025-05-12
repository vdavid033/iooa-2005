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
      <q-list bordered separator>
        <q-item v-for="(comment, index) in comments" :key="index">
          <q-item-section>
           <q-item-label>Korisnik: {{ comment.username || ('#' + comment.id_korisnika) }}</q-item-label>
            <q-item-label caption>{{ comment.sadrzaj_komentara }}</q-item-label>
            <q-item-label class="text-caption text-grey">
              {{ formatDate(comment.datum_komentara) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div v-else class="text-grey">Još nema komentara.</div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const newComment = ref('')
const comments = ref([])
const route = useRoute()

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

  const id_objava = parseInt(route.params.id)
  const id_korisnika = parseInt(localStorage.getItem('user_id')) || 1

  try {
    await axios.post('http://localhost:3000/api/comments', {
      id_objava,
      id_korisnika,
      sadrzaj_komentara: newComment.value
    })
    
    newComment.value = ''
    await fetchComments() // osvježi prikaz komentara iz baze
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

<template>
<q-btn
  label="← Natrag na forum"
  color="primary"
  flat
  @click="goBack"
  class="q-mb-md"
/>
  <q-page class="q-pa-md">

    <!-- Prikaz OBJAVE -->
    <q-card v-if="post" class="q-mb-md">
      <q-card-section>
        <div class="text-h5">{{ post.title }}</div>
        <div class="text-subtitle2 text-grey">
          {{ post.author }} | {{ post.date }} | {{ post.category }}
        </div>
        <div class="q-mt-md" v-html="post.content"></div>
        <div class="q-mt-sm">
          <span v-for="tag in post.tags" :key="tag" class="q-mr-sm text-blue">#{{ tag }}</span>
        </div>
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
import CommentSection from 'components/CommentSection.vue'

// Ovdje ćeš učitati sve objave (normalno bi išlo s backend servera)
const posts = ref([
  {
    id: 1,
    author: 'Kolega Kolegić',
    category: 'Tehnička podrška',
    title: 'Naslov prve objave',
    content: 'Ovo je puni sadržaj prve objave...',
    tags: ['Python', 'Pomoć'],
    date: '2025-04-25'
  },
  {
    id: 2,
    author: 'Ana Studentić',
    category: 'Pitanja i odgovori',
    title: 'Druga tema',
    content: 'Brzo pitanje vezano uz zadaću...',
    tags: ['Algoritmi', 'Zadaća'],
    date: '2025-04-24'
  }
])
function goBack() {
  router.push('/forum')
}
const route = useRoute()
const router = useRouter() 
const post = ref(null)

onMounted(() => {
  const postId = parseInt(route.params.id, 10)
  post.value = posts.value.find(p => p.id === postId)
})
</script>

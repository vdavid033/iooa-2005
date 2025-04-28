<template>
  <q-page padding>
    <!-- Forma za kreiranje nove objave -->
    <q-card class="q-pa-md q-mb-lg">
      <q-card-section>
        <div class="text-h6">Kreiraj novu objavu</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="title" label="Naslov objave" filled />
        <q-editor v-model="content" label="Sadržaj" class="q-mt-md" />

        <q-select
          v-model="category"
          :options="categories"
          label="Kategorija"
          filled
          class="q-mt-md"
        />

        <q-select
          v-model="tags"
          :options="availableTags"
          label="Tagovi"
          multiple
          filled
          class="q-mt-md"
          :hint="'Maksimalno 5 tagova'"
          :rules="[val => val.length <= 5 || 'Dozvoljeno je do 5 tagova.']"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Spremi" color="primary" @click="savePost" />
      </q-card-actions>
    </q-card>

    <!-- Sekcija za filtriranje objava -->
    <div class="q-mb-md">
  <div class="row items-center q-gutter-sm">
    <q-select
      v-model="selectedTags"
      :options="availableTags.map(tag => ({ label: tag, value: tag }))"
      label="Filtriraj po tagovima"
      multiple
      filled
      emit-value
      map-options
      style="flex: 1"
    />

    <q-btn
      label="Filtriraj"
      color="primary"
      @click="filterPosts"
    />
  </div>
</div>

    <!-- Lista objava -->
    <div v-for="post in paginatedPostsFiltered" :key="post.id" class="q-mb-md">
      <q-card clickable @click="goToPost(post.id)" class="q-pa-sm">
        <q-card-section class="row items-center justify-between">
          <div>
            <q-avatar icon="person" size="sm" />
            <span class="q-ml-sm text-subtitle2">{{ post.author }}</span>
          </div>
          <div class="text-grey text-caption">&lt;{{ post.category }}&gt;</div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">{{ post.title }}</div>
          <div class="text-body2 q-mt-xs">{{ post.preview }}</div>
        </q-card-section>

        <q-card-section class="row items-center justify-between">
          <div class="text-blue">
            <span v-for="tag in post.tags" :key="tag" class="q-mr-sm">#{{ tag }}</span>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-icon name="chat_bubble_outline" />
            <span>{{ post.comments }}</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Paginacija -->
    <q-pagination
      v-model="page"
      :max="maxPage"
      max-pages="5"
      boundary-numbers
      color="primary"
      class="q-mt-md"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const title = ref('')
const content = ref('')
const category = ref(null)
const tags = ref([])

const categories = ['Pitanja i odgovori', 'Tehnička podrška', 'Razmjena materijala']
const availableTags = ['Python', 'Programiranje', 'Ispit', 'Frontend', 'Quasar', 'Pomoć','Algoritmi', 'Zadaća']

const posts = ref([
  {
    id: 1,
    author: 'Kolega Kolegić',
    category: 'Tehnička podrška',
    title: 'Naslov prve objave',
    preview: 'Ovo je kratki sadržaj prve objave...',
    tags: ['Python', 'Pomoć'],
    comments: 7,
    date: '2025-04-25'
  },
  {
    id: 2,
    author: 'Ana Studentić',
    category: 'Pitanja i odgovori',
    title: 'Druga tema',
    preview: 'Brzo pitanje vezano uz zadaću...',
    tags: ['Algoritmi', 'Zadaća'],
    comments: 3,
    date: '2025-04-24'
  },
])

const selectedTags = ref([])
const filteredPosts = ref([])
filteredPosts.value = posts.value

const page = ref(1)
const perPage = 20

const paginatedPostsFiltered = computed(() =>
  filteredPosts.value.slice((page.value - 1) * perPage, page.value * perPage)
)

const maxPage = computed(() =>
  Math.ceil(filteredPosts.value.length / perPage)
)

function savePost() {
  if (title.value && content.value && category.value) {
    const newPost = {
      id: posts.value.length + 1,
      author: 'Laura',
      category: category.value,
      title: title.value,
      preview: content.value.slice(0, 100) + '...',
      tags: tags.value,
      comments: 0,
      date: new Date().toISOString().split('T')[0]
    }
    posts.value.unshift(newPost)

    // Nakon dodavanja nove objave osvježi filtrirane postove
    filterPosts()

    // Reset forme
    title.value = ''
    content.value = ''
    category.value = null
    tags.value = []

    console.log('Nova objava dodana!', newPost)
  } else {
    alert('Popuni sva obavezna polja!')
  }
}

function filterPosts() {
  if (selectedTags.value.length === 0) {
    filteredPosts.value = posts.value
  } else {
    filteredPosts.value = posts.value.filter(post =>
      post.tags.some(tag => selectedTags.value.includes(tag))
    )
  }
  // Reset paginacije kad se filtrira
  page.value = 1
}

function goToPost(id) {
  router.push(`/objava/${id}`)
}
</script>

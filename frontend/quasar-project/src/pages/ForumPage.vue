<template>
  <q-page padding>
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
          option-label="label"
          option-value="value"
          label="Kategorija"
          filled
          class="q-mt-md"
        />

        <q-select
          v-model="tags"
          :options="availableTags"
          option-label="label"
          option-value="value"
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
import axios from 'axios'
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const router = useRouter()

const title = ref('')
const content = ref('')
const category = ref(null)
const tags = ref([])

const posts = ref([])

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

const availableTags = ref([])
const categories = ref([])

onMounted(() => {
  fetchTagovi()
  fetchKategorije()
  fetchObjave()
})

async function fetchTagovi() {
  const response = await axios.get('http://localhost:3000/api/tagovi')
  availableTags.value = response.data
}

async function fetchKategorije() {
  try {
    const response = await axios.get('http://localhost:3000/api/kategorije')
    categories.value = response.data
  } catch (error) {
    console.error('❌ Ne mogu dohvatiti kategorije:', error)
  }
}

async function savePost() {
  if (title.value && content.value && category.value) {
    try {
      const noviPodaci = {
        naslov: title.value,
        sadrzaj: content.value,
        datum: new Date().toISOString().slice(0, 19).replace('T', ' '),
        fk_korisnik: 1, //trebat ce promijeniti kada se spoje korisnici
        fk_kategorija: category.value?.value || null,
        tagovi: tags.value.map(t => t.value)

      }

      const response = await axios.post('http://localhost:3000/api/objave', noviPodaci)

      $q.notify({
        type: 'positive',
        message: 'Objava uspješno spremljena!',
        timeout: 2500,
        position: 'top-right'
      })

      title.value = ''
      content.value = ''
      category.value = null
      tags.value = []
      
      await fetchObjave()

    } 
    catch (error) {
      console.error('Greška pri spremanju objave:', error)
      alert('Greška pri spremanju. Provjeri backend.')
    }
  } else {
    alert('Popuni sva obavezna polja!')
  }
}

async function fetchObjave() {
  try {
    const response = await axios.get('http://localhost:3000/api/objave')
    posts.value = response.data
    filteredPosts.value = posts.value
  } catch (error) {
    console.error('❌ Ne mogu dohvatiti objave:', error)
    $q.notify({
      type: 'negative',
      message: 'Greška pri dohvaćanju objava.',
      timeout: 2500
    })
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

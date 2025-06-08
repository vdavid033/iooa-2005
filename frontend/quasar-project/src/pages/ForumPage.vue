<template>
  <q-page padding class="bg-white">
    <!-- Forma za unos nove objave -->
    <q-card class="q-pa-sm q-mb-lg bg-blue-1 text-dark shadow-2 form-card">
      <q-card-section>
        <div class="text-h6 text-primary">Kreiraj novu objavu</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="title" label="Naslov objave" filled color="primary" dense />
        <q-editor v-model="content" label="Sadržaj" class="q-mt-sm" min-height="80px" height="120px" />

        <q-select v-model="category" :options="categories" option-label="label" option-value="value" label="Kategorija"
          filled color="primary" class="q-mt-sm" dense />

        <q-select v-model="tags" :options="availableTags" option-label="label" option-value="value" label="Tagovi"
          multiple filled color="primary" class="q-mt-sm" dense :hint="'Maksimalno 5 tagova'"
          :rules="[val => val.length <= 5 || 'Dozvoljeno je do 5 tagova.']" />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Spremi" color="primary" glossy @click="savePost" />
      </q-card-actions>
    </q-card>

    <!-- Filter po tagovima -->
    <div class="q-mb-md">
      <div class="row items-center q-gutter-sm">
        <q-select v-model="selectedTags" :options="availableTags" option-label="label" option-value="label"
          label="Filtriraj po tagovima" multiple filled emit-value map-options color="primary" dense style="flex: 1" />
        <q-select v-model="selectedUser" :options="availableUsers" option-label="label" option-value="value"
          label="Filtriraj po korisniku" filled emit-value map-options clearable color="primary" dense style="flex: 1"
          class="q-mr-sm" />
        <q-btn label="Filtriraj" color="primary" glossy @click="filterPosts" />
      </div>
    </div>

    <!-- Lista objava -->
    <div v-for="post in paginatedPostsFiltered" :key="post.id" class="q-mb-md">
      <div class="post-card-wrapper">
        <q-card clickable @click="goToPost(post.id)" class="q-pa-sm post-card shadow-1 bg-white text-dark">
          <q-card-section class="row items-center justify-between">
            <div>
              <q-avatar icon="person" size="sm" color="primary" text-color="white" />
              <span class="q-ml-sm text-subtitle2">{{ post.author }}</span>
            </div>
            <div class="column items-end">
              <div class="text-blue-9 text-caption">&lt;{{ post.category }}&gt;</div>
              <div class="text-grey-7 text-caption">{{ formatDate(post.date) }}</div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-h6 text-primary">{{ post.title }}</div>
            <div class="text-body2 q-mt-xs">{{ post.preview }}</div>
          </q-card-section>

          <q-card-section class="row items-center justify-between">
            <div class="text-blue-9">
              <span v-for="tag in post.tags" :key="tag" class="q-mr-sm">
                #{{ tag }}
              </span>
            </div>

            <q-btn flat dense round @click.stop="goToPost(post.id)" class="row items-center q-gutter-xs text-blue">
              <q-icon name="chat_bubble_outline" />
              <span>{{ post.comments }}</span>
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-pagination v-model="page" :max="maxPage" max-pages="5" boundary-numbers color="primary" class="q-mt-md" />
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      title: '',
      content: '',
      category: null,
      tags: [],
      selectedTags: [],
      page: 1,
      categories: [],
      availableTags: [],
      paginatedPostsFiltered: [],
    };
  },
  methods: {
    savePost() {
      // Tvoja funkcija za spremanje posta
    },
    filterPosts() {
      // Tvoja funkcija za filtriranje posta
    },
    goToPost(postId) {
      // Navigacija na detalje posta
    },
    formatDate(dateString) {
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Date(dateString)
        .toLocaleString('hr-HR', options)
        .replace(',', ' u');
    },
  },
};
</script>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const selectedUser = ref(null)

// Podaci za formu
const title = ref('')
const content = ref('')
const category = ref(null)
const tags = ref([])

// Postovi i tagovi
const posts = ref([])
const selectedTags = ref([])
const filteredPosts = ref([])

const page = ref(1)
const perPage = 20

const availableTags = ref([])
const categories = ref([])

// Paginacija
const paginatedPostsFiltered = computed(() =>
  filteredPosts.value.slice((page.value - 1) * perPage, page.value * perPage)
)
const maxPage = computed(() =>
  Math.ceil(filteredPosts.value.length / perPage)
)
const availableUsers = computed(() => {
  // Pretpostavka: svaki post ima post.author (možda je kod tebe post.korisnik ili post.username, prilagodi!)
  const userSet = new Set()
  posts.value.forEach(post => {
    if (post.author) userSet.add(post.author)
  })
  return Array.from(userSet).map(username => ({
    label: username,
    value: username
  }))
})

onMounted(() => {
  fetchTagovi()
  fetchKategorije()
  fetchObjave()
})

async function fetchTagovi() {
  try {
    const response = await axios.get('http://localhost:3000/api/tagovi')
    availableTags.value = response.data // format: [{ label: 'skripta', value: 'skripta' }, ...]
  } catch (error) {
    console.error(' Ne mogu dohvatiti tagove:', error)
  }
}

async function fetchKategorije() {
  try {
    const response = await axios.get('http://localhost:3000/api/kategorije')
    categories.value = response.data
  } catch (error) {
    console.error(' Ne mogu dohvatiti kategorije:', error)
  }
}

async function fetchObjave() {
  try {
    const response = await axios.get('http://localhost:3000/api/objave')
    posts.value = response.data
    filteredPosts.value = response.data
  } catch (error) {
    console.error(' Ne mogu dohvatiti objave:', error)
    $q.notify({
      type: 'negative',
      message: 'Greška pri dohvaćanju objava.',
      timeout: 2500
    })
  }
}

async function savePost() {
  if (title.value && content.value && category.value) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Nisi prijavljen. Prijavi se prije objavljivanja.')
        return
      }

      const noviPodaci = {
        naslov: title.value,
        sadrzaj: content.value,
        datum: new Date().toISOString().slice(0, 19).replace('T', ' '),
        fk_kategorija: category.value?.value || null,
        tagovi: tags.value.map(t => t.value)
      }

      await axios.post('http://localhost:3000/api/objave', noviPodaci, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      $q.notify({
        type: 'positive',
        message: 'Objava uspješno spremljena!',
        timeout: 2500,
        position: 'top-right'
      })

      // Reset forme
      title.value = ''
      content.value = ''
      category.value = null
      tags.value = []

      await fetchObjave()
    } catch (error) {
      console.error('Greška pri spremanju objave:', error)
      $q.notify({
        type: 'negative',
        message: 'Greška pri spremanju objave.',
        timeout: 2500,
        position: 'top-right'
      })
    }
  } else {
    $q.notify({
      type: 'warning',
      message: 'Popuni sva obavezna polja!',
      timeout: 2500,
      position: 'top-right'
    })
  }
}

async function filterPosts() {
  // Ako nije odabran nijedan tag, prikaži sve objave (s dodatkom filtera po korisniku)
  if (!selectedTags.value || selectedTags.value.length === 0) {
    if (!selectedUser.value) {
      filteredPosts.value = posts.value
    } else {
      filteredPosts.value = posts.value.filter(post =>
        post.author === selectedUser.value
      )
    }
    page.value = 1
    return
  }

  try {
    const tagQuery = selectedTags.value.join(',')
    const res = await axios.get(`http://localhost:3000/api/objave/filtrirane?tagovi=${tagQuery}`)
    let postsByTags = res.data

    // DODATNO filtriranje po korisniku
    if (selectedUser.value) {
      postsByTags = postsByTags.filter(post =>
        post.author === selectedUser.value
      )
    }

    filteredPosts.value = postsByTags
  } catch (err) {
    console.error('Greška pri filtriranju objava:', err)
    $q.notify({
      type: 'negative',
      message: 'Greška pri filtriranju objava.',
      timeout: 2500
    })
  }
  page.value = 1 // reset paginacije
}

function goToPost(id) {
  router.push(`/objava/${id}`)
}

</script>
<style scoped>
/* Cijela stranica ostaje bijela */
.q-page.bg-white {
  background-color: white;
}

/* Plava pozadina forme */
.q-card.bg-blue-1 {
  background-color: #e3f2fd !important;
  /* svijetloplava Quasar nijansa */
}

/* Stil za wrapper oko svake objave */
.post-card-wrapper {
  position: relative;
}

/* Plava crta s desne strane kartice */
.post-card-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  background-color: #1976d2;
  /* Quasar primary blue */
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

/* Kartica objave */
.post-card {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  border-radius: 8px;
}

/* Hover efekt */
.post-card:hover {
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.25);
  transform: translateY(-2px);
  cursor: pointer;
}

.form-card {
  border-radius: 10px;
}
</style>

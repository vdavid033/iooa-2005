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
              <div class="text-grey-7 text-caption">
                {{ post.edited_at ? 
                    `Uređeno ${formatDate(post.edited_at)}` : 
                    formatDate(post.date) 
                }}
              </div>
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

            <div class="row items-center q-gutter-xs">
              <!-- Edit gumb samo za vlastite objave -->
              <q-btn 
                v-if="isCurrentUserPost(post)"
                flat 
                dense 
                round 
                icon="edit" 
                color="primary" 
                size="sm"
                @click.stop="openEditDialog(post)"
              >
                <q-tooltip>Uredi objavu</q-tooltip>
              </q-btn>

              <q-btn flat dense round @click.stop="goToPost(post.id)" class="row items-center q-gutter-xs text-blue">
                <q-icon name="chat_bubble_outline" />
                <span>{{ post.comments }}</span>
              </q-btn>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Edit Dialog - naslov, sadržaj, kategorija, tagovi -->
    <q-dialog v-model="editDialog" persistent>
      <q-card style="min-width: 600px; max-width: 800px;">
        <q-card-section>
          <div class="text-h6 text-primary">
            <q-icon name="edit" class="q-mr-sm" />
            Uredi objavu
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Naslov -->
          <q-input
            v-model="editTitle"
            label="Naslov objave"
            filled
            maxlength="100"
            counter
            :disable="editLoading"
            :error="!!editTitleError"
            :error-message="editTitleError"
            class="q-mb-md"
          />
          
          <!-- Sadržaj -->
          <q-input
            v-model="editContent"
            type="textarea"
            label="Sadržaj objave"
            rows="4"
            maxlength="256"
            counter
            filled
            :disable="editLoading"
            :error="!!editContentError"
            :error-message="editContentError"
            class="q-mb-md"
          />

          <!--  Kategorija -->
          <q-select
            v-model="editCategory"
            :options="categories"
            option-label="label"
            option-value="value"
            label="Kategorija"
            filled
            color="primary"
            :disable="editLoading"
            :error="!!editCategoryError"
            :error-message="editCategoryError"
            class="q-mb-md"
          />

          <!-- Tagovi -->
          <q-select
            v-model="editTags"
            :options="availableTags"
            option-label="label"
            option-value="value"
            label="Tagovi"
            multiple
            filled
            color="primary"
            :disable="editLoading"
            :error="!!editTagsError"
            :error-message="editTagsError"
            :hint="'Maksimalno 5 tagova'"
            :rules="[val => val.length <= 5 || 'Dozvoljeno je do 5 tagova.']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Odustani" 
            color="grey" 
            @click="closeEditDialog"
            :disable="editLoading" 
          />
          <q-btn 
            flat 
            label="Spremi sve izmjene" 
            color="primary" 
            @click="saveEdit"
            :loading="editLoading"
            :disable="!editTitle.trim() || !editContent.trim() || !editCategory"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { api } from 'boot/axios'
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

// Edit funkcionalnost s naslovom, sadržajem, kategorijom i tagovima
const editDialog = ref(false)
const editingPost = ref(null)
const editTitle = ref('')
const editContent = ref('')
const editCategory = ref(null)        
const editTags = ref([])              
const editLoading = ref(false)
const editTitleError = ref('')
const editContentError = ref('')
const editCategoryError = ref('')     
const editTagsError = ref('')         

// Paginacija
const paginatedPostsFiltered = computed(() =>
  filteredPosts.value.slice((page.value - 1) * perPage, page.value * perPage)
)
const maxPage = computed(() =>
  Math.ceil(filteredPosts.value.length / perPage)
)
const availableUsers = computed(() => {
  const userSet = new Set()
  posts.value.forEach(post => {
    if (post.author) userSet.add(post.author)
  })
  return Array.from(userSet).map(username => ({
    label: username,
    value: username
  }))
})

// Funkcija za provjeru vlasništva objave
function isCurrentUserPost(post) {
  const token = localStorage.getItem('token')
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    // Usporedba po ID-u (najsigurnija)
    if (post.authorId !== undefined && payload.id !== undefined) {
      return payload.id == post.authorId
    }
    
    // Fallback na imena
    if (payload.korisnicko_ime && post.author) {
      return payload.korisnicko_ime.toLowerCase() === post.author.toLowerCase()
    } else if (payload.ime && post.author) {
      return payload.ime.toLowerCase() === post.author.toLowerCase()
    }
    
    return false
  } catch (error) {
    console.error('Greška pri dekodiranju tokena:', error)
    return false
  }
}

// openEditDialog učitava sve podatke objave
async function openEditDialog(post) {
  editingPost.value = post
  editTitle.value = post.title
  editContent.value = post.preview
  
  // Reset grešaka
  editTitleError.value = ''
  editContentError.value = ''
  editCategoryError.value = ''
  editTagsError.value = ''
  
  // dohvati potpune podatke objave s kategorijom i tagovima
  try {
    editLoading.value = true
    const response = await api.get(`/objave/${post.id}`)
    const fullPost = response.data
    
    console.log('Potpuni podaci objave:', fullPost)
    
    // Postavi kategoriju
    if (fullPost.kategorija) {
      editCategory.value = categories.value.find(cat => 
        cat.label === fullPost.kategorija || cat.value === fullPost.fk_kategorija
      ) || null
    } else {
      editCategory.value = null
    }
    
    // Postavi tagove
    if (fullPost.tagovi && Array.isArray(fullPost.tagovi)) {
      editTags.value = availableTags.value.filter(tag => 
        fullPost.tagovi.includes(tag.label)
      )
    } else {
      editTags.value = []
    }
    
    console.log('Edit kategorija:', editCategory.value)
    console.log('Edit tagovi:', editTags.value)
    
    editDialog.value = true
    
  } catch (error) {
    console.error('Greška pri dohvaćanju podataka objave:', error)
    $q.notify({
      type: 'negative',
      message: 'Greška pri učitavanju podataka objave',
      timeout: 2500
    })
  } finally {
    editLoading.value = false
  }
}

// closeEditDialog čisti sve podatke
function closeEditDialog() {
  editDialog.value = false
  editingPost.value = null
  editTitle.value = ''
  editContent.value = ''
  editCategory.value = null
  editTags.value = []
  editTitleError.value = ''
  editContentError.value = ''
  editCategoryError.value = ''
  editTagsError.value = ''
}

// saveEdit s kategorijom i tagovima
async function saveEdit() {
  // Reset grešaka
  editTitleError.value = ''
  editContentError.value = ''
  editCategoryError.value = ''
  editTagsError.value = ''
  
  let hasErrors = false
  
  // Validacija naslova
  if (!editTitle.value.trim()) {
    editTitleError.value = 'Naslov objave ne može biti prazan'
    hasErrors = true
  } else if (editTitle.value.length > 100) {
    editTitleError.value = 'Naslov ne može biti duži od 100 znakova'
    hasErrors = true
  }
  
  // Validacija sadržaja
  if (!editContent.value.trim()) {
    editContentError.value = 'Sadržaj objave ne može biti prazan'
    hasErrors = true
  } else if (editContent.value.length > 256) {
    editContentError.value = 'Sadržaj ne može biti duži od 256 znakova'
    hasErrors = true
  }
  
  // Validacija kategorije
  if (!editCategory.value) {
    editCategoryError.value = 'Kategorija je obavezna'
    hasErrors = true
  }
  
  // Validacija tagova
  if (editTags.value.length > 5) {
    editTagsError.value = 'Maksimalno 5 tagova je dozvoljeno'
    hasErrors = true
  }
  
  if (hasErrors) {
    return
  }

  editLoading.value = true

  try {
    // šaljemo sve podatke
    const response = await api.put(`/objave/${editingPost.value.id}`, {
      naslov: editTitle.value.trim(),
      sadrzaj: editContent.value.trim(),
      fk_kategorija: editCategory.value?.value || null,
      tagovi: editTags.value.map(tag => tag.value)
    })

    if (response.data.success) {
      //  ažuriraj sve podatke u listi
      const index = posts.value.findIndex(p => p.id === editingPost.value.id)
      if (index !== -1) {
        posts.value[index] = { 
          ...posts.value[index], 
          title: editTitle.value.trim(),
          preview: editContent.value.trim(),
          category: editCategory.value?.label || '',
          tags: editTags.value.map(tag => tag.label),
          edited_at: response.data.objava.edited_at
        }
      }
      
      const filteredIndex = filteredPosts.value.findIndex(p => p.id === editingPost.value.id)
      if (filteredIndex !== -1) {
        filteredPosts.value[filteredIndex] = { 
          ...filteredPosts.value[filteredIndex], 
          title: editTitle.value.trim(),
          preview: editContent.value.trim(),
          category: editCategory.value?.label || '',
          tags: editTags.value.map(tag => tag.label),
          edited_at: response.data.objava.edited_at
        }
      }
      
      closeEditDialog()
      
      $q.notify({
        type: 'positive',
        message: 'Objava je uspješno ažurirana',
        timeout: 2500,
        position: 'top-right'
      })
    }
  } catch (error) {
    console.error('Greška pri ažuriranju objave:', error)
    
    const errorMsg = error.response?.data?.error || 'Greška prilikom spremanja'
    editContentError.value = errorMsg
  } finally {
    editLoading.value = false
  }
}

onMounted(() => {
  fetchTagovi()
  fetchKategorije()
  fetchObjave()
})

async function fetchTagovi() {
  try {
    const response = await axios.get('http://localhost:3000/api/tagovi')
    availableTags.value = response.data
  } catch (error) {
    console.error('Ne mogu dohvatiti tagove:', error)
  }
}

async function fetchKategorije() {
  try {
    const response = await axios.get('http://localhost:3000/api/kategorije')
    categories.value = response.data
  } catch (error) {
    console.error('Ne mogu dohvatiti kategorije:', error)
  }
}

async function fetchObjave() {
  try {
    const response = await axios.get('http://localhost:3000/api/objave')
    posts.value = response.data
    filteredPosts.value = response.data
  } catch (error) {
    console.error('Ne mogu dohvatiti objave:', error)
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

      await api.post('/objave', noviPodaci)

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
  page.value = 1
}

function goToPost(id) {
  router.push(`/objava/${id}`)
}
</script>

<style scoped>
.q-page.bg-white {
  background-color: white;
}

.q-card.bg-blue-1 {
  background-color: #e3f2fd !important;
}

.post-card-wrapper {
  position: relative;
}

.post-card-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  background-color: #1976d2;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.post-card {
  transition: box-shadow 0.3s ease, transform 0.2s ease;
  border-radius: 8px;
}

.post-card:hover {
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.25);
  transform: translateY(-2px);
  cursor: pointer;
}

.form-card {
  border-radius: 10px;
}
</style>
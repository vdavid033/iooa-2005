<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-md q-mb-md">
      <div class="col-12 col-md-auto">
        <h1 class="text-h5">Kolegiji — Glavna mapa 📂</h1>
      </div>
      <div class="col-12 col-md-auto search-wrapper">
        <q-input
          rounded
          color="primary"
          outlined
          v-model="searchQuery"
          placeholder="🔍 Pretraži..."
          class="search-bar"
          clearable
          @update:model-value="handleLiveInput"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <q-btn
              flat
              round
              color="white"
              icon="search"
              @click="handleSearch"
              :aria-label="'Pretraži'"
            />
          </template>
        </q-input>
      </div>
    </div>

    <div v-if="searchQuery && (filteredFolders.length || fileResults.length || userResults.length)" class="q-mb-md">
      <div v-if="filteredFolders.length" class="q-mb-sm">
        <template v-if="filteredFolders.length">
          <div class="text-subtitle1 q-mb-xs">Rezultati pretrage mapa:</div>
          <q-list bordered separator>
            <q-item
              v-for="folder in filteredFolders"
              :key="folder.id_mape"
              clickable
              @click="openFolder(folder)"
            >
              <q-item-section>
                <q-item-label>{{ folder.ime_mape }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </div>
      <div v-if="userResults.length" class="q-mb-sm">
        <template v-if="userResults.length">
          <div class="text-subtitle1 q-mb-xs">Rezultati pretrage korisnika:</div>
          <q-list bordered separator>
            <q-item v-for="u in userResults" :key="u.id">
              <q-item-section avatar>
                <q-avatar size="32px">
                  <img :src="u.avatar" alt="avatar" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ u.name }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </div>
      <div v-if="fileResults.length">
        <template v-if="fileResults.length">
          <div class="text-subtitle1 q-mb-xs">Rezultati pretrage dokumenata:</div>
          <q-list bordered separator>
            <q-item v-for="file in fileResults" :key="file.id_dokumenta">
              <q-item-section>
                <q-item-label>{{ file.ime_dokumenta }}</q-item-label>
                <q-item-label caption>{{ file.putanja }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  :href="`/api/documents/download/${file.id_dokumenta}`"
                  target="_blank"
                  icon="download"
                  flat
                  dense
                  color="primary"
                  title="Preuzmi"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </template>
      </div>
    </div>

    <div class="row items-center justify-end q-mb-lg">
      <q-btn
        v-if="isAdmin()"
        color="primary"
        icon="add"
        label="Kreiraj mapu"
        @click="showCreateModal = true"
        rounded
        unelevated
      />
    </div>

    <LoadingSpinner v-if="isLoading" />
    <ErrorMessage v-else-if="errorMessage" :message="errorMessage" />
    <div v-else>
      <div v-if="folders.length">
        <folder-grid
          :folders="folders"
          :on-folder-click="openFolder"
          :is-admin="isAdmin()"
          @edit-folder="editFolder"
          @delete-folder="confirmDelete"
        />
      </div>
      <div v-else class="text-subtitle2 q-pa-md">Nema mapa za prikaz.</div>
    </div>

    <q-btn
      color="primary"
      icon="history"
      label="Povijest izmjena dokumenata"
      rounded
      unelevated
      @click="openLog"
    />

    <transition name="fade">
      <div v-show="showLogDialog" class="q-mt-md">
        <q-card flat bordered class="q-pa-sm log-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="text-h6">DNEVNIK AKTIVNOSTI</div>
              <q-btn dense flat icon="close" @click="showLogDialog = false" />
            </div>
          </q-card-section>

          <q-card-section class="q-pa-none">
            <div class="q-table-responsive dnevnik-table-scroll">
              <q-table
                v-model:pagination="logPagination"
                :rows="logRows"
                :columns="logColumns"
                row-key="id"
                dense
                flat
                :rows-per-page-options="[10, 25, 50]"
                :sort-by="['created_at', 'updated_at']"
                :sort-desc="false"
              >
                <template #body-cell-created_at="props">
                  <q-td :props="props">{{ formatDate(props.row.created_at) }}</q-td>
                </template>

                <template #body-cell-updated_at="props">
                  <q-td :props="props">{{ formatDate(props.row.updated_at) }}</q-td>
                </template>

                <template #body-cell-mapa="props">
                  <q-td :props="props">
                    <q-btn
                      v-if="props.row.mapa && props.row.fk_mape"
                      :to="`/folders/${props.row.fk_mape}`"
                      flat
                      dense
                      color="primary"
                      class="q-pa-none q-ma-none"
                      style="text-transform: none; min-width: 0"
                    >
                      {{ props.row.mapa }}
                    </q-btn>
                    <span v-else>{{ props.row.mapa }}</span>
                  </q-td>
                </template>
                <template #body-cell-path="props">
                  <q-td :props="props">
                    <div class="dnevnik-path">{{ props.row.path }}</div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Zatvori" color="primary" @click="showLogDialog = false" />
          </q-card-actions>
        </q-card>
      </div>
    </transition>

    <CreateFolderModal v-model="showCreateModal" @create="handleCreateFolder" />
    <EditFolderDialog v-model="showEditDialog" :folder="folderToEdit" @save="handleRenameFolder" />
    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :folder="folderToDelete"
      @confirm="handleDeleteFolder"
    />
  </q-page>
</template>

<script setup>
const searchQuery = ref('')

const fileResults = ref([])
const userResults = ref([])
const allUsers = ref([])

const filteredFolders = computed(() => {
  if (!searchQuery.value) return folders.value
  return folders.value.filter((f) =>
    f.ime_mape.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Live input handler: update local/lazy results and clear stale remote (documents)
function handleLiveInput() {
  const q = searchQuery.value
  if (!q) {
    fileResults.value = []
    userResults.value = []
    return
  }

  // Clear previous document results while typing; they will be refreshed on Enter/click
  fileResults.value = []

  // Immediately clear previous user results to avoid showing stale items while typing
  userResults.value = []

  // Update user results live (lazy-load all users once)
  ;(async () => {
    try {
      // Snapshot current query to prevent race conditions
      const qSnapshot = String(q).toLowerCase()
      if (!allUsers.value.length) {
        const uResp = await api.get('/groups/users/all')
        allUsers.value = Array.isArray(uResp.data) ? uResp.data : []
      }
      const results = allUsers.value.filter((u) =>
        String(u.name || '').toLowerCase().includes(qSnapshot)
      )
      // Only apply if the input hasn't changed meanwhile
      if (String(searchQuery.value).toLowerCase() === qSnapshot) {
        userResults.value = results
      }
    } catch (e) {
      userResults.value = []
    }
  })()
}

async function handleSearch() {
  // Folder search is local, file search is backend
  if (!searchQuery.value) {
    fileResults.value = []
    userResults.value = []
    return
  }
  try {
    const resp = await api.get(`/documents/search?q=${encodeURIComponent(searchQuery.value)}`)
    fileResults.value = Array.isArray(resp.data) ? resp.data : []
  } catch (e) {
    fileResults.value = []
  }
  try {
    // Lazy-load all users once, then filter on the client
    if (!allUsers.value.length) {
      const uResp = await api.get('/groups/users/all')
      allUsers.value = Array.isArray(uResp.data) ? uResp.data : []
    }
    const q = searchQuery.value.toLowerCase()
    userResults.value = allUsers.value.filter((u) =>
      String(u.name || '').toLowerCase().includes(q)
    )
  } catch (e) {
    userResults.value = []
  }
}
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import FolderGrid from 'components/FolderGrid.vue'
import LoadingSpinner from 'components/LoadingSpinner.vue'
import ErrorMessage from 'components/ErrorMessage.vue'
import CreateFolderModal from 'components/CreateFolderModal.vue'
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog.vue'
import EditFolderDialog from 'components/EditFolderDialog.vue'
import { useUser } from 'src/composables/useUser'

defineOptions({
  name: 'FoldersPage',
})

const router = useRouter()
const $q = useQuasar()
const folders = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const { isAdmin, loadUserFromToken } = useUser()
const showCreateModal = ref(false)
const folderToEdit = ref(null)
const folderToDelete = ref(null)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

// Activity log dialog
const showLogDialog = ref(false)
const logColumns = [
  { name: 'user_fullname', label: 'Ime i prezime', field: 'user_fullname', sortable: true },
  { name: 'document', label: 'Dokument', field: 'document', sortable: true },
  { name: 'mapa', label: 'Mapa', field: 'mapa' },
  { name: 'created_at', label: 'Datum kreiranja', field: 'created_at', sortable: true },
  { name: 'updated_at', label: 'Datum zadnje izmjene', field: 'updated_at', sortable: true },
]
const logRows = ref([])
const logPagination = ref({ page: 1, rowsPerPage: 10, sortBy: 'created_at', descending: false })
// For now we load all logs at once (no pagination) — fetched from API only
function loadAllLogs() {
  ;(async () => {
    try {
      const resp = await api.get('/logs')
      const data = Array.isArray(resp.data) ? resp.data : []
      logRows.value = data.map((r) => ({
        id: r.id,
        user_fullname: r.user_fullname,
        document: r.document,
        mapa: r.mapa,
        fk_mape: r.fk_mape,
        created_at: r.created_at,
        updated_at: r.updated_at,
        path: r.path,
      }))
      if (!logRows.value.length) {
        console.info('No logs returned from API')
      }
    } catch (e) {
      console.error('loadAllLogs API failed', e)
      logRows.value = []
      $q.notify({ type: 'warning', message: 'Ne mogu učitati dnevnik aktivnosti.', timeout: 3000 })
    }
  })()
}

async function fetchRootFolders() {
  isLoading.value = true
  try {
    const response = await api.get('/folders')
    folders.value = response.data
  } catch (error) {
    console.error('fetchRootFolders error:', error)
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      'Došlo je do greške prilikom učitavanja mapa.'
    $q.notify({ type: 'negative', message: errorMessage.value, timeout: 3000 })
  } finally {
    isLoading.value = false
  }
}
async function handleCreateFolder({ name }) {
  try {
    const response = await api.post('/folders', {
      ime_mape: name,
      id_parent_mapa: null,
    })
    fetchRootFolders()
    $q.notify({
      type: 'positive',
      message: `Mapa "${response.data.ime_mape}" je kreirana.`,
      position: 'top',
      timeout: 3000,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Dogodila se greška prilikom kreiranja mape.',
      position: 'top',
      timeout: 3000,
    })
  }
}

function openFolder(folder) {
  router.push(`/folders/${folder.id_mape}`)
}

function editFolder(folder) {
  folderToEdit.value = folder
  showEditDialog.value = true
}

async function handleRenameFolder(updated) {
  try {
    await api.put(`/folders/${updated.id_mape}`, {
      ime_mape: updated.ime_mape,
    })
    fetchRootFolders()
    $q.notify({
      type: 'positive',
      message: `Mapa "${updated.ime_mape}" je preimenovana.`,
      position: 'top',
      timeout: 3000,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Dogodila se greška prilikom preimenovanja mape.',
      position: 'top',
      timeout: 3000,
    })
  }
}

function confirmDelete(folder) {
  folderToDelete.value = folder
  showDeleteDialog.value = true
}

async function handleDeleteFolder(folder) {
  try {
    await api.delete(`/folders/${folder.id_mape}`)
    fetchRootFolders()
    $q.notify({
      type: 'positive',
      message: `Mapa "${folder.ime_mape}" je obrisana.`,
      position: 'top',
      timeout: 3000,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Dogodila se greška prilikom brisanja mape.',
      position: 'top',
      timeout: 3000,
    })
  }
}

onMounted(() => {
  loadUserFromToken()
  fetchRootFolders()
})

function openLog() {
  showLogDialog.value = true
  $q.notify({ type: 'info', message: 'Otvaram dnevnik aktivnosti', timeout: 800 })
  if (logRows.value.length === 0) {
    loadAllLogs()
  }
}

function formatDate(value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    // Croatian style: day month year (e.g. 01. prosinca 2025.)
    return new Intl.DateTimeFormat('hr-HR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d)
  } catch (e) {
    return value
  }
}
</script>

<style scoped>
.search-bar .q-field__control,
.search-bar .q-field__native {
  background: #1976d2 !important;
  color: #fff !important;
  font-weight: bold;
}
.search-bar .q-field__control {
  min-height: 42px; /* match default q-btn height */
}
.search-bar .q-field__native {
  min-height: 42px; /* ensure input area matches button height */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.search-bar .q-field__marginal {
  height: 42px; /* align prepend/append areas (icons, clear button) */
}
.search-bar input::placeholder {
  color: #fff !important;
  opacity: 1;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.log-card {
  width: 100%;
}

.q-table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.dnevnik-table-scroll {
  max-height: 500px;
  min-height: 300px;
  overflow-y: auto;
}

.q-table-responsive .q-table__middle {
  min-width: 900px; /* keeps columns readable on wide screens; allows horizontal scroll on small screens */
}

.dnevnik-path {
  white-space: normal;
  word-break: break-word;
  max-width: 320px;
}

/* Keep the search bar from stretching full width */
.search-wrapper {
  max-width: 420px;
}
</style>

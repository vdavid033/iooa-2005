<template>
  <q-page class="q-pa-md">
    <h1 class="text-h5">Kolegiji (Root mape)</h1>

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
        <div class="q-table-responsive">
          <q-table
            :rows="logRows"
            :columns="logColumns"
            row-key="id"
            dense
            flat
            hide-bottom
            :rows-per-page-options="[]"
            :sort-by="['created_at','updated_at']"
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
                <q-btn v-if="props.row.mapa && props.row.fk_mape"
                  :to="`/folders/${props.row.fk_mape}`"
                  flat dense color="primary" class="q-pa-none q-ma-none" style="text-transform:none;min-width:0;">
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
import { onMounted, ref } from 'vue'
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

// Activity log dialog + sample data
const showLogDialog = ref(false)
const logColumns = [
  { name: 'user_fullname', label: 'Ime i prezime', field: 'user_fullname' },
  { name: 'document', label: 'Dokument', field: 'document' },
  { name: 'mapa', label: 'Mapa', field: 'mapa' },
  { name: 'created_at', label: 'Datum kreiranja', field: 'created_at' },
  { name: 'updated_at', label: 'Datum zadnje izmjene', field: 'updated_at' },
  { name: 'path', label: 'Putanja', field: 'path' },
]
const logRows = ref([])
// For now we load all logs at once (no pagination)
// simulated full dataset (in real use, fetch from API)
const _allLogRows = []
const firstNames = ['Ivan','Ana','Marko','Petra','Luka','Maja','Katarina','Tomislav','Ivana','Dario']
const lastNames = ['Horvat','Marić','Kovač','Babić','Novak','Perić','Jurić','Radić','Filipović','Šarić']
for (let i = 1; i <= 200; i++) {
  const fn = firstNames[i % firstNames.length]
  const ln = lastNames[i % lastNames.length]
  const createdDay = ((i % 28) + 1).toString().padStart(2, '0')
  const createdHour = (8 + (i % 8)).toString().padStart(2, '0')
  const updatedHour = (9 + (i % 12)).toString().padStart(2, '0')
  const created_at = `2025-10-${createdDay} ${createdHour}:00`
  const updated_at = `2025-11-${((i%30)+1).toString().padStart(2,'0')} ${updatedHour}:30`
  _allLogRows.push({ id: i, user_fullname: `${fn} ${ln}`, document: `fajl_${i}.pdf`, created_at, updated_at, path: `/uploads/fajl_${i}.pdf` })
}

function loadAllLogs () {
  // fetch real logs from backend if available; fallback to simulated data
  ;(async () => {
    try {
      const resp = await api.get('/logs')
      if (Array.isArray(resp.data) && resp.data.length) {
        // Backend returns mapped fields: id, user_fullname, document, mapa, created_at, updated_at, path
        logRows.value = resp.data.map(r => ({
          id: r.id,
          user_fullname: r.user_fullname,
          document: r.document,
          mapa: r.mapa,
          fk_mape: r.fk_mape,
          created_at: r.created_at,
          updated_at: r.updated_at,
          path: r.path
        }))
        console.log('Loaded', logRows.value.length, 'documents from API')
        return
      }
    } catch (e) {
      console.warn('loadAllLogs API failed, using simulated data', e)
    }

    // fallback to simulated dataset
    logRows.value = _allLogRows.slice()
  })()
}

async function fetchRootFolders() {
  isLoading.value = true
  try {
    const response = await api.get('/folders')
    folders.value = response.data
  } catch (error) {
    console.error('fetchRootFolders error:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Došlo je do greške prilikom učitavanja mapa.'
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

function openLog () {
  showLogDialog.value = true
  $q.notify({ type: 'info', message: 'Otvaram dnevnik aktivnosti', timeout: 800 })
  if (logRows.value.length === 0) {
    loadAllLogs()
  }
}

function formatDate (value) {
  if (!value) return ''
  try {
    const d = new Date(value)
    // Croatian style: day month year (e.g. 01. prosinca 2025.)
    return new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: 'long', year: 'numeric' }).format(d)
  } catch (e) {
    return value
  }
}

</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }

.log-card {
  width: 100%;
}

.q-table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.q-table-responsive .q-table__middle {
  min-width: 900px; /* keeps columns readable on wide screens; allows horizontal scroll on small screens */
}

.dnevnik-path {
  white-space: normal;
  word-break: break-word;
  max-width: 320px;
}
</style>

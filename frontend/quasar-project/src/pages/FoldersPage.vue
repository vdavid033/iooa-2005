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
    <q-card flat bordered class="q-pa-sm" style="max-width:1000px;">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h6">DNEVNIK AKTIVNOSTI</div>
          <q-btn dense flat icon="close" @click="showLogDialog = false" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <div>
          <q-table
            :rows="logRows"
            :columns="logColumns"
            row-key="id"
            dense
            flat
            hide-bottom
            :rows-per-page-options="[]"
          />
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
  { name: 'date', label: 'Datum', field: 'date' },
  { name: 'user', label: 'Korisnik', field: 'user' },
  { name: 'action', label: 'Akcija', field: 'action' },
  { name: 'document', label: 'Dokument', field: 'document' },
]
const logRows = ref([
  { id: 1, date: '2025-12-01 10:12', user: 'ivan', action: 'Uredio dokument', document: 'predavanje1.pdf' },
  { id: 2, date: '2025-11-30 14:05', user: 'ana', action: 'Kreirala dokument', document: 'zadatak2.docx' },
  { id: 3, date: '2025-11-29 09:45', user: 'marko', action: 'Obrisao dokument', document: 'stari_rokovi.xlsx' },
])
// For now we load all logs at once (no pagination)
// simulated full dataset (in real use, fetch from API)
const _allLogRows = []
for (let i = 1; i <= 200; i++) {
  _allLogRows.push({ id: i, date: `2025-11-${(i%30)+1} 0${i%24}:00`, user: `user${i%10}`, action: ['Kreirao','Uredio','Obrisao'][i%3] + ' dokument', document: `fajl_${i}.pdf` })
}

function loadAllLogs () {
  // replace any existing rows with the full dataset
  logRows.value = _allLogRows.slice()
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

</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s }
.fade-enter-from, .fade-leave-to { opacity: 0 }
</style>

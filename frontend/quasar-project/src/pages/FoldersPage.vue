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
      <folder-grid
        :folders="folders"
        :on-folder-click="openFolder"
        :is-admin="isAdmin()"
        @edit-folder="editFolder"
        @delete-folder="confirmDelete"
      />
    </div>
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

async function fetchRootFolders() {
  isLoading.value = true
  try {
    const response = await api.get('/folders')
    folders.value = response.data
  } catch (error) {
    errorMessage.value = error.value || 'Došlo je do greške prilikom učitavanja mapa.'
  } finally {
    isLoading.value = false
  }
}

async function handleCreateFolder({ name }) {
  try {
    const response = await api.post(
      '/folders',
      {
        ime_mape: name,
        id_parent_mapa: null,
      },
      {
        headers: { korisnicko_ime: 'marko456' }, // simulacija autentikacije admin usera
      }
    )
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
    await api.put(
      `/folders/${updated.id_mape}`,
      {
        ime_mape: updated.ime_mape,
      },
      {
        headers: { korisnicko_ime: 'marko456' },
      }
    )
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
    await api.delete(`/folders/${folder.id_mape}`, {
      headers: { korisnicko_ime: 'marko456' },
    })
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
</script>

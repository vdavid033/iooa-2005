<template>
  <q-page class="q-pa-md">
    <h1 class="text-h5 q-mb-lg">Sadržaj mape</h1>
    <div class="row items-center justify-end q-gutter-sm">
      <q-btn
        v-if="isAdmin()"
        color="primary"
        icon="add"
        label="Kreiraj mapu"
        @click="showCreateModal = true"
        rounded
        unelevated
      />
      <q-btn color="grey-5" icon="arrow_back" label="Natrag" @click="back" rounded unelevated />
    </div>
    <LoadingSpinner v-if="isLoading" />
    <ErrorMessage v-else-if="errorMessage" :message="errorMessage" />
    <div v-else>
      <div v-if="subfolders.length > 0">
        <h3 class="text-h6 q-mb-lg">Podmape</h3>
        <folder-grid
          :folders="subfolders"
          :on-folder-click="openFolder"
          :is-admin="isAdmin()"
          @edit-folder="editFolder"
          @delete-folder="confirmDelete"
        />
      </div>
      <div class="q-mt-xl">
      <h3 class="text-h6 q-mb-lg">Dokumenti</h3>
      <file-grid
        :files="documents"
        :folder-id="folderId"
        :is-admin="isAdmin"
        :show-upload-button="true"
        :username="'marko456'"
        @refresh="fetchDocuments"
      />
    </div>
      <div
        v-if="subfolders.length === 0 && documents.length === 0"
        class="q-mt-xl text-center text-grey"
      >
        Ova mapa je prazna.
      </div>
    </div>
  </q-page>
  <CreateFolderModal
    v-model="showCreateModal"
    :parent-id="folderId"
    :kolegiji="kolegiji"
    @create="handleCreateFolder"
  />
  <EditFolderDialog v-model="showEditDialog" :folder="folderToEdit" @save="handleRenameFolder" />
  <ConfirmDeleteDialog
    v-model="showDeleteDialog"
    :folder="folderToDelete"
    @confirm="handleDeleteFolder"
  />
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'
import FolderGrid from 'components/FolderGrid.vue'
import FileGrid from 'components/FileGrid.vue'
import LoadingSpinner from 'components/LoadingSpinner.vue'
import ErrorMessage from 'components/ErrorMessage.vue'
import CreateFolderModal from 'components/CreateFolderModal.vue'
import EditFolderDialog from 'components/EditFolderDialog.vue'
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog.vue'
import { useUser } from 'src/composables/useUser'

defineOptions({
  name: 'FolderContentPage',
})

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const { isAdmin, loadUserFromToken } = useUser()
const folderId = ref(route.params.folderId)
const showCreateModal = ref(false)
const subfolders = ref([])
const documents = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const folderToEdit = ref(null)
const folderToDelete = ref(null)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const kolegiji = ref([])

async function fetchKolegiji() {
  const response = await api.get('/folders')
  kolegiji.value = response.data
}

async function fetchFolderContent() {
  isLoading.value = true
  try {
    const response = await api.get(`/folders/${folderId.value}`)
    subfolders.value = response.data
  } catch (error) {
    errorMessage.value =
      error?.response?.data?.message || 'Došlo je do greške greške prilikom učitavanja podmapa.'
  } finally {
    isLoading.value = false
  }
}

async function handleCreateFolder({ name, parentId }) {
  try {
    const response = await api.post(
      '/folders',
      {
        ime_mape: name,
        id_parent_mapa: Number(parentId),
      },
      {
        headers: { korisnicko_ime: 'marko456' },
      }
    )
    fetchFolderContent()
    $q.notify({
      type: 'positive',
      message: `Podmapa "${response.data.ime_mape}" je kreirana.`,
      position: 'top',
      timeout: 3000,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Dogodila se greška prilikom kreiranja podmape.',
      position: 'top',
      timeout: 3000,
    })
  }
}

function back() {
  router.back()
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
    fetchFolderContent()
    $q.notify({
      type: 'positive',
      message: `Podmapa "${updated.ime_mape}" je preimenovana.`,
      position: 'top',
      timeout: 3000,
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.message || 'Dogodila se greška prilikom preimenovanja podmape.',
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
    fetchFolderContent()
    $q.notify({
      type: 'positive',
      message: `Podmapa "${folder.ime_mape}" je obrisana.`,
      position: 'top',
      timeout: 3000,
    })
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Dogodila se greška prilikom brisanja podmape.',
      position: 'top',
      timeout: 3000,
    })
  }
}

async function fetchDocuments() {
  try {
    const response = await api.get(`/documents/${folderId.value}`)
    documents.value = response.data
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Dogodila se greška prilikom dohvata dokumenata.',
      position: 'top',
      timeout: 3000,
    })
  }
}

async function loadFolderData() {
  await fetchFolderContent()
  await fetchDocuments()
}

onMounted(() => {
  loadUserFromToken()
  loadFolderData()
  fetchKolegiji()
})

watch(
  () => route.params.folderId,
  async (newId) => {
    folderId.value = newId
    await nextTick()
    loadFolderData()
  }
)
</script>

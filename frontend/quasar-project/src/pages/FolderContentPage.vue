<template>
  <q-page class="q-pa-md">
    <h1 class="text-h5 q-mb-lg">Sadržaj mape</h1>
    <div class="row items-center justify-end q-gutter-sm">
      <q-btn
        v-if="isAdmin"
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
          :is-admin="isAdmin"
          @edit-folder="editFolder"
          @delete-folder="confirmDelete"
        />
      </div>
      <div v-if="documents.length > 0" class="q-mt-xl">
        <h3 class="text-h6 q-mb-lg">Dokumenti</h3>
        <file-grid 
          :files="documents"
          :folder-id="folderId"
          :is-admin="isAdmin"
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
  
  <!-- Rest of your modals and dialogs -->
  <CreateFolderModal
    v-model="showCreateModal"
    :parent-folders="[currentFolder]"
    :kolegiji="kolegiji"
    :forced-parent-id="folderId"
    :forced-kolegij-id="activeKolegijId"
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FolderGrid from 'components/FolderGrid.vue'
import FileGrid from 'components/FileGrid.vue'
import LoadingSpinner from 'components/LoadingSpinner.vue'
import ErrorMessage from 'components/ErrorMessage.vue'
import CreateFolderModal from 'components/CreateFolderModal.vue'
import EditFolderDialog from 'components/EditFolderDialog.vue'
import ConfirmDeleteDialog from 'components/ConfirmDeleteDialog.vue'
import { api } from 'boot/axios'

defineOptions({
  name: 'FolderContentPage',
})

const route = useRoute()
const router = useRouter()
const isAdmin = true
const folderId = ref(route.params.folderId)
const showCreateModal = ref(false)
const subfolders = ref([])
const documents = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const activeKolegijId = ref(null)
const kolegiji = ref([
  { id: 1, naziv: 'Baze podataka' },
  { id: 2, naziv: 'Programiranje 1' },
  { id: 3, naziv: 'Matematika' },
  { id: 4, naziv: 'Računalne mreže' },
])
const currentFolder = computed(() => {
  return {
    id_mape: Number(folderId.value),
    ime_mape: getFolderNameById(folderId.value),
  }
})
const folderToEdit = ref(null)
const folderToDelete = ref(null)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

function fetchFolderContent() {
  isLoading.value = true
  errorMessage.value = ''
  subfolders.value = []
  documents.value = []

  setTimeout(() => {
    // simulacija kao da cekamo API poziv
    try {
      if (folderId.value === '1') {
        activeKolegijId.value = 1
        subfolders.value = [
          { id_mape: 5, ime_mape: 'Predavanja', id_parent_mapa: 1, fk_kolegija: 1 },
          { id_mape: 6, ime_mape: 'Vježbe', id_parent_mapa: 1, fk_kolegija: 1 },
        ]
        documents.value = [{ name: 'SQL_osnove.pdf', type: 'file', size: 150000 }]
      } else if (folderId.value === '2') {
        activeKolegijId.value = 2
        subfolders.value = []
        documents.value = [
          { name: 'Zadaci_1.docx', type: 'file', size: 50000 },
          { name: 'Primjeri_kolokvij.pdf', type: 'file', size: 200000 },
        ]
      } else {
        activeKolegijId.value = null
        subfolders.value = []
        documents.value = []
        errorMessage.value = 'Folder ili datoteka nije pronađen/a.'
      }
    } catch (error) {
      errorMessage.value = 'Došlo je do greške prilikom učitavanja podataka.'
    } finally {
      isLoading.value = false
    }
  }, 800) // malo kašnjenje da spinner bude vidljiv
}

function back() {
  router.back()
}

function openFolder(folder) {
  router.push(`/folders/${folder.id_mape}`)
}

function getFolderNameById(id) {
  if (id === '1') return 'Baze podataka'
  if (id === '2') return 'Programiranje 1'
  return 'Nepoznata mapa'
}

function handleCreateFolder({ name, kolegijId }) {
  const newFolder = {
    id_mape: Date.now(),
    ime_mape: name,
    id_parent_mapa: folderId.value,
    fk_kolegija: kolegijId,
  }
  subfolders.value.push(newFolder)
}

function editFolder(folder) {
  folderToEdit.value = folder
  showEditDialog.value = true
}

function confirmDelete(folder) {
  folderToDelete.value = folder
  showDeleteDialog.value = true
}

function handleRenameFolder(updated) {
  const folder = folders.value.find((f) => f.id_mape === updated.id_mape)
  if (folder) folder.ime_mape = updated.ime_mape
}

function handleDeleteFolder(folder) {
  folders.value = folders.value.filter((f) => f.id_mape !== folder.id_mape)
}

async function fetchDocuments() {
  try {
    const response = await api.get('/documents', {
      params: { folderId: folderId.value }
    })
    documents.value = response.data
  } catch (error) {
    console.error('Error fetching documents:', error)
  }
}

// Rest of your existing methods...

onMounted(() => {
  fetchFolderContent()
})

watch(
  () => route.params.folderId,
  (newId) => {
    folderId.value = newId
    fetchFolderContent()
  }
)
</script>

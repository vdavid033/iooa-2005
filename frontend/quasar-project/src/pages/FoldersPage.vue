<template>
  <q-page class="q-pa-md">
    <h1 class="text-h5">Kolegiji (Root mape)</h1>
    <div class="row items-center justify-end q-mb-lg">
      <q-btn
        v-if="isAdmin"
        color="primary"
        icon="add"
        label="Kreiraj mapu"
        @click="showCreateModal = true"
        rounded
        unelevated
      />
    </div>
    <LoadingSpinner v-if="isLoading"/>
    <ErrorMessage v-else-if="errorMessage" :message="errorMessage"/>
    <div v-else>
      <folder-grid
        :folders="folders"
        :on-folder-click="openFolder"
        :is-admin="isAdmin"
        @edit-folder="editFolder"
        @delete-folder="confirmDelete"
      />
    </div>
    <CreateFolderModal
      v-model="showCreateModal"
      :parent-folders="[]"
      :kolegiji="kolegiji"
      @create="handleCreateFolder"
    />
    <EditFolderDialog
      v-model="showEditDialog"
      :folder="folderToEdit"
      @save="handleRenameFolder"
    />

    <ConfirmDeleteDialog
      v-model="showDeleteDialog"
      :folder="folderToDelete"
      @confirm="handleDeleteFolder"
    />
  </q-page>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import FolderGrid from 'components/FolderGrid.vue'
import LoadingSpinner from 'components/LoadingSpinner.vue'
import ErrorMessage from 'components/ErrorMessage.vue'
import CreateFolderModal from 'components/CreateFolderModal.vue'
import ConfirmDeleteDialog from "components/ConfirmDeleteDialog.vue";
import EditFolderDialog from "components/EditFolderDialog.vue";

defineOptions({
  name: 'FoldersPage'
})

const router = useRouter()
const folders = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const isAdmin = true
const showCreateModal = ref(false)
const kolegiji = ref([
  {id: 1, naziv: 'Baze podataka'},
  {id: 2, naziv: 'Programiranje 1'},
  {id: 3, naziv: 'Matematika'},
  {id: 4, naziv: 'Računalne mreže'}
])
const folderToEdit = ref(null)
const folderToDelete = ref(null)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)

function fetchRootFolders () {
  isLoading.value = true
  errorMessage.value = ''
  folders.value = []
  setTimeout(() => {
    try {
      folders.value = [
        {id_mape: 1, ime_mape: 'Baze podataka', id_parent_mapa: null, fk_kolegija: 1},
        {id_mape: 2, ime_mape: 'Programiranje 1', id_parent_mapa: null, fk_kolegija: 2},
        {id_mape: 3, ime_mape: 'Vježbe', id_parent_mapa: null, fk_kolegija: 3},
        {id_mape: 4, ime_mape: 'Ispiti', id_parent_mapa: null, fk_kolegija: 4}
      ]
    } catch (error) {
      errorMessage.value = 'Došlo je do greške prilikom učitavanja mapa.'
    } finally {
      isLoading.value = false
    }
  }, 800)
}

function handleCreateFolder ({name, parentId}) {
  const newFolder = {
    id_mape: Date.now(),
    ime_mape: name,
    id_parent_mapa: null,
    fk_kolegija: kolegijId
  }
  folders.value.push(newFolder)
}

function openFolder (folder) {
  router.push(`/folders/${folder.id_mape}`)
}

function editFolder (folder) {
  folderToEdit.value = folder
  showEditDialog.value = true
}

function confirmDelete (folder) {
  folderToDelete.value = folder
  showDeleteDialog.value = true
}

function handleRenameFolder (updated) {
  const folder = folders.value.find(f => f.id_mape === updated.id_mape)
  if (folder) folder.ime_mape = updated.ime_mape
}

function handleDeleteFolder (folder) {
  folders.value = folders.value.filter(f => f.id_mape !== folder.id_mape)
}

onMounted(() => {
  fetchRootFolders()
})
</script>

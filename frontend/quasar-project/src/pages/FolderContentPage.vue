<template>
  <q-page class="q-pa-md">
    <h1 class="text-h5 q-mb-lg">Sadržaj mape</h1>
    <div class="row items-center justify-end q-gutter-sm">
      <q-btn
        color="primary"
        icon="add"
        label="Kreiraj mapu"
        @click="showCreateModal = true"
        rounded
        unelevated
      />
      <q-btn
        color="grey-5"
        icon="arrow_back"
        label="Natrag"
        @click="back"
        rounded
        unelevated
      />
    </div>
    <LoadingSpinner v-if="isLoading"/>
    <ErrorMessage v-else-if="errorMessage" :message="errorMessage"/>
    <div v-else>
      <div v-if="subfolders.length > 0">
        <h3 class="text-h6 q-mb-lg">Podmape</h3>
        <folder-grid
          :folders="subfolders"
          :on-folder-click="openFolder"
        />
      </div>
      <div v-if="documents.length > 0" class="q-mt-xl">
        <h3 class="text-h6 q-mb-lg">Dokumenti</h3>
        <file-grid :files="documents"/>
      </div>
      <div v-if="subfolders.length === 0 && documents.length === 0" class="q-mt-xl text-center text-grey">
        Ova mapa je prazna.
      </div>
    </div>
  </q-page>
  <CreateFolderModal
    v-model="showCreateModal"
    :parent-folders="[currentFolder]"
    :kolegiji="kolegiji"
    :forced-parent-id="folderId"
    :forced-kolegij-id="activeKolegijId"
    @create="handleCreateFolder"
  />
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import FolderGrid from 'components/FolderGrid.vue'
import FileGrid from 'components/FileGrid.vue'
import LoadingSpinner from "components/LoadingSpinner.vue"
import ErrorMessage from "components/ErrorMessage.vue"
import CreateFolderModal from 'components/CreateFolderModal.vue'

defineOptions({
  name: 'FolderContentPage'
})

const route = useRoute()
const router = useRouter()
const folderId = ref(route.params.folderId)
const showCreateModal = ref(false)
const subfolders = ref([])
const documents = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const activeKolegijId = ref(null)
const kolegiji = ref([
  {id: 1, naziv: 'Baze podataka'},
  {id: 2, naziv: 'Programiranje 1'},
  {id: 3, naziv: 'Matematika'},
  {id: 4, naziv: 'Računalne mreže'}
])
const currentFolder = computed(() => {
  return {
    id_mape: Number(folderId.value),
    ime_mape: getFolderNameById(folderId.value)
  }
})

function fetchFolderContent () {
  isLoading.value = true
  errorMessage.value = ''
  subfolders.value = []
  documents.value = []

  setTimeout(() => {   // simulacija kao da cekamo API poziv
    try {
      if (folderId.value === '1') {
        activeKolegijId.value = 1
        subfolders.value = [
          {id_mape: 3, ime_mape: 'Predavanja', id_parent_mapa: 1, fk_kolegija: 1},
          {id_mape: 4, ime_mape: 'Vježbe', id_parent_mapa: 1, fk_kolegija: 1}
        ]
        documents.value = [
          {name: 'SQL_osnove.pdf', type: 'file', size: 150000}
        ]
      } else if (folderId.value === '2') {
        activeKolegijId.value = 2
        subfolders.value = []
        documents.value = [
          {name: 'Zadaci_1.docx', type: 'file', size: 50000},
          {name: 'Primjeri_kolokvij.pdf', type: 'file', size: 200000}
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

function back () {
  router.back()
}

function openFolder (folder) {
  router.push(`/folders/${folder.id_mape}`)
}

function getFolderNameById (id) {
  if (id === '1') return 'Baze podataka'
  if (id === '2') return 'Programiranje 1'
  return 'Nepoznata mapa'
}

function handleCreateFolder ({name, kolegijId}) {
  const newFolder = {
    id_mape: Date.now(),
    ime_mape: name,
    id_parent_mapa: folderId.value,
    fk_kolegija: kolegijId
  }
  subfolders.value.push(newFolder)
}

onMounted(() => {
  fetchFolderContent()
})

watch(() => route.params.folderId, (newId) => {
  folderId.value = newId
  fetchFolderContent()
})
</script>

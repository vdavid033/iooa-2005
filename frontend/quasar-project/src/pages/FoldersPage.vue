<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-lg">
      <h1 class="text-h5">Kolegiji (Root mape)</h1>
      <q-btn
        v-if="isAdmin"
        color="primary"
        icon="add"
        label="Kreiraj datoteku"
        @click="createFolder"
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
      />
    </div>
  </q-page>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import FolderGrid from 'components/FolderGrid.vue'
import LoadingSpinner from 'components/LoadingSpinner.vue'
import ErrorMessage from 'components/ErrorMessage.vue'

defineOptions({
  name: 'FoldersPage'
})

const router = useRouter()
const folders = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const isAdmin = true

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
      console.error(error)
      errorMessage.value = 'Došlo je do greške prilikom učitavanja mapa.'
    } finally {
      isLoading.value = false
    }
  }, 800)
}

function createFolder () {
  console.log('Kreiranje nove mape...')
}

function openFolder (folder) {
  router.push(`/folders/${folder.id_mape}`)
}

onMounted(() => {
  fetchRootFolders()
})
</script>

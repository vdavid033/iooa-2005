<template>
  <q-page class="q-pa-md">
    <h1 class="text-h5 q-mb-md">Sadržaj mape</h1>
    <div v-if="subfolders.length > 0">
      <h3 class="text-h6 q-mb-md">Podmape</h3>
      <div class="q-gutter-md row">
        <div
          v-for="folder in subfolders"
          :key="folder.id_mape"
          class="col-xs-6 col-sm-4 col-md-3 col-lg-2 flex flex-center"
        >
          <q-card
            class="cursor-pointer flex flex-col items-center q-pa-sm"
            flat
            bordered
            @click="openFolder(folder)"
          >
            <q-icon name="folder" size="48px" color="primary"/>
            <div class="text-center q-mt-sm">{{ folder.ime_mape }}</div>
          </q-card>
        </div>
      </div>
    </div>
    <div v-if="documents.length > 0" class="q-mt-xl">
      <h3 class="text-h6 q-mb-md">Dokumenti</h3>
      <file-explorer :files="documents"/>
    </div>
    <div v-if="subfolders.length === 0 && documents.length === 0" class="q-mt-xl text-center text-grey">
      Ova mapa je prazna.
    </div>
  </q-page>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import FileExplorer from 'components/FileExplorer/FileExplorer.vue'

defineOptions({
  name: 'FolderContentPage'
})

const route = useRoute()
const router = useRouter()
const folderId = route.params.folderId
const subfolders = ref([])
const documents = ref([])

function fetchFolderContent () {
  if (folderId === '1') {
    subfolders.value = [
      {id_mape: 3, ime_mape: 'Predavanja', id_parent_mapa: 1, fk_kolegija: 1},
      {id_mape: 4, ime_mape: 'Vježbe', id_parent_mapa: 1, fk_kolegija: 1}
    ]
    documents.value = [
      {name: 'SQL_osnove.pdf', type: 'file', size: 150000}
    ]
  } else if (folderId === '2') {
    subfolders.value = []
    documents.value = [
      {name: 'Zadaci_1.docx', type: 'file', size: 50000},
      {name: 'Primjeri_kolokvij.pdf', type: 'file', size: 200000}
    ]
  } else {
    subfolders.value = []
    documents.value = []
  }
}

function openFolder (folder) {
  router.push(`/folders/${folder.id_mape}`)
}

onMounted(() => {
  fetchFolderContent()
})
</script>

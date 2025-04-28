<template>
  <q-page class="q-pa-md">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-h5">Kolegiji (Root mape)</h1>
      <q-btn
        v-if="isAdmin"
        color="primary"
        icon="add"
        label="Add folder"
        @click="createFolder"
        class="q-ml-auto q-px-lg q-rounded-xl"
      />
    </div>
    <div class="q-gutter-md row">
      <div
        v-for="folder in folders"
        :key="folder.id_mape"
        class="col-xs-6 col-sm-4 col-md-3 col-lg-2 flex flex-center"
      >
        <q-card
          class="cursor-pointer flex flex-col items-center q-pa-sm"
          flat
          bordered
          @click="openFolder(folder)"
        >
          <q-icon name="folder" size="64px" color="primary"/>
          <div class="text-center q-mt-sm">{{ folder.ime_mape }}</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'

defineOptions({
  name: 'FoldersPage'
})

const router = useRouter()
const folders = ref([
  {id_mape: 1, ime_mape: 'Baze podataka', id_parent_mapa: null, fk_kolegija: 1},
  {id_mape: 2, ime_mape: 'Programiranje 1', id_parent_mapa: null, fk_kolegija: 2}
])
const isAdmin = true

function createFolder () {
  console.log('Kreiranje nove mape...')
}

function openFolder (folder) {
  router.push(`/folders/${folder.id_mape}`)
}
</script>

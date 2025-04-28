<template>
  <q-page padding>
    <file-explorer
      root-path="`/folders/${folderId}`"
      class="q-ma-md"
    />
  </q-page>
</template>

<script setup>
import {useRoute} from 'vue-router'
import FileExplorer from '../components/FileExplorer/FileExplorer.vue';

const route = useRoute()
const folderId = route.params.folderId
</script>

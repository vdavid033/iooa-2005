<template>
  <q-page padding>
    <file-explorer 
      root-path="/documents"
      class="q-ma-md"
    />
  </q-page>
</template>

<script setup>
import FileExplorer from '../components/FileExplorer/FileExplorer.vue';
</script>
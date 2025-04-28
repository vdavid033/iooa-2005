<template>
  <q-page class="q-pa-md">
    <!-- Naslov (opcionalno) -->
    <h1 class="text-h4 q-mb-md">My File Explorer</h1>
    
    <!-- File Explorer komponenta -->
    <file-explorer 
      root-path="/"
      class="q-mt-md"
    />
  </q-page>
</template>
<script setup>
import FileExplorer from 'components/FileExplorer';
</script>

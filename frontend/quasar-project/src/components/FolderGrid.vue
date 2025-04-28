<template>
  <div class="row q-gutter-xs justify-start">
    <div
      v-for="folder in folders"
      :key="folder.id_mape"
      class="folder-item cursor-pointer"
      @click="() => onFolderClick(folder)"
    >
      <div class="column items-center">
        <q-icon name="folder" size="64px" color="primary"/>
        <div class="q-mt-sm text-center">{{ folder.ime_mape }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  folders: {
    type: Array,
    required: true
  },
  onFolderClick: {
    type: Function,
    required: true
  }
})
</script>

<style scoped>
.folder-item {
  width: 120px;
  margin-bottom: 12px;
}
</style>

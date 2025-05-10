<template>
  <div class="row q-gutter-xs justify-start">
    <div
      v-for="folder in folders"
      :key="folder.id_mape"
      class="folder-item cursor-pointer"
      @click="() => onFolderClick(folder)"
    >
      <div class="column items-center">
        <div class="folder-icon-wrapper">
          <q-icon name="folder" size="64px" color="primary"/>
          <q-btn
            v-if="isAdmin"
            class="folder-edit-btn"
            dense
            size="sm"
            flat
            round
            icon="edit"
            color="primary"
            @click.stop="$emit('edit-folder', folder)"
            :title="'Uredi mapu'"
          />
          <q-btn
            v-if="isAdmin"
            class="folder-delete-btn"
            dense
            size="sm"
            flat
            round
            icon="delete"
            color="negative"
            @click.stop="$emit('delete-folder', folder)"
            :title="'Obriši mapu'"
          />
        </div>
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
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.folder-item {
  width: 120px;
  margin-bottom: 12px;
  position: relative;
}

.folder-icon-wrapper {
  position: relative;
  display: inline-block;
}

.folder-edit-btn {
  position: absolute;
  top: -10px;
  left: 0;
  visibility: hidden;
}

.folder-delete-btn {
  position: absolute;
  top: -10px;
  right: 0;
  visibility: hidden;
}

.folder-item:hover .folder-edit-btn,
.folder-item:hover .folder-delete-btn {
  visibility: visible;
}
</style>

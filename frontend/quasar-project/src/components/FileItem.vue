<template>
  <q-item clickable @click="$emit('click', item)">
    <q-item-section avatar>
      <q-icon :name="item.type === 'dir' ? 'folder' : 'insert_drive_file'" />
    </q-item-section>
    <q-item-section>
      {{ item.name }}
    </q-item-section>
    <q-item-section side v-if="item.type === 'file'">
      {{ formatSize(item.size) }}
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  item: { type: Object, required: true }
});

const formatSize = (bytes) => {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024**i).toFixed(1)} ${units[i]}`;
};
</script>
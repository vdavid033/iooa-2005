<template>
  <div>
    <q-item
      clickable
      tag="a"
      target="_blank"
      :href="link"
    >
      <q-item-section
        v-if="icon"
        avatar
      >
        <q-icon :name="icon" />
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
        <q-item-label caption>{{ caption }}</q-item-label>
      </q-item-section>
    </q-item>

    <!-- Dummy notifikacija -->
    <q-item clickable v-ripple to="/notifikacija">
      <q-item-section avatar>
        <q-icon name="notifications" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Notifikacija Dummy</q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script setup>
defineOptions({
  name: 'EssentialLink'
})

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: '#'
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>
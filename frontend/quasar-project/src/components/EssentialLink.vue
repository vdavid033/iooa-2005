<template>
  <q-item
    v-if="to"
    clickable
    tag="router-link"
    :to="to"
  >
    <q-item-section avatar v-if="icon">
      <q-icon :name="icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>

  <q-item
    v-else
    clickable
    tag="a"
    target="_blank"
    :href="link"
  >
    <q-item-section avatar v-if="icon">
      <q-icon :name="icon"/>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
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
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  to: {
    type: String,
    default: ''
  }
})
</script>

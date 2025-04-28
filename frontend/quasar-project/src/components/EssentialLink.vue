<template>
  <q-item
    v-if="props.to"
    clickable
    :to="props.to"
    tag="router-link"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon :name="props.icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
      <q-item-label caption>{{ props.caption }}</q-item-label>
    </q-item-section>
  </q-item>

  <q-item
    v-else
    clickable
    tag="router-link"
    :to="link"
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

    type: [String, Object],
    required: true

  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

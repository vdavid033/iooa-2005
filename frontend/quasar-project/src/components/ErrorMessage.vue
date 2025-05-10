<template>
  <div class="q-my-xl text-center text-negative">
    {{ message }}
  </div>
</template>

<script setup>
defineOptions({
  name: 'ErrorMessage',
})

const props = defineProps({
  message: {
    type: String,
    required: true,
  },
})
</script>

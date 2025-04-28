<template>
  <div v-if="show" class="fixed bottom-4 right-4 bg-primary text-white q-pa-md rounded-borders shadow-4">
    {{ message }}
  </div>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const message = ref('')

function triggerNotification(text) {
  message.value = text
  show.value = true
  setTimeout(() => {
    show.value = false
  }, 5000) // 5 sekundi
}

// omogući funkciju drugim komponentama
defineExpose({
  triggerNotification
})
</script>

<style scoped>
/* Dodatni fade-out efekt */
.fade-leave-active {
  transition: opacity 1s;
}
.fade-leave-to {
  opacity: 0;
}
</style>

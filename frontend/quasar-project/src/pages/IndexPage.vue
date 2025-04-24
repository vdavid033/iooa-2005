<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    >

    <!-- Gumb za unos navigacviju prema stranici obaveza -->
    <q-btn @click="goToCreateObaveza" label="Kalendar Obaveza" color="primary" class="q-mt-md" />
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToCreateObaveza = () => {
  // Navigacija prema stranici za unos obaveze
  router.push('/kalendar-obaveze');
}
</script>

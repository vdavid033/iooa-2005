<template>
    <q-page class="q-pa-md">
      <h1 class="text-h5 q-mb-lg">Dokumenti korisnika marko456</h1>
      <div class="row items-center justify-end q-gutter-sm">
        <q-btn
          color="primary"
          icon="arrow_back"
          label="Natrag"
          @click="back"
          rounded
          unelevated
        />
      </div>
      <LoadingSpinner v-if="isLoading" />
      <ErrorMessage v-else-if="errorMessage" :message="errorMessage" />
      <div v-else>
        <file-grid
          :files="documents"
          :is-admin="true"
          :show-upload-button="true"
          :username="'marko456'"
          @refresh="fetchDocuments"
        />
      </div>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { api } from 'boot/axios'
  import FileGrid from 'components/FileGrid.vue'
  import LoadingSpinner from 'components/LoadingSpinner.vue'
  import ErrorMessage from 'components/ErrorMessage.vue'
  
  const router = useRouter()
  const documents = ref([])
  const isLoading = ref(false)
  const errorMessage = ref('')
  
  async function fetchDocuments() {
    isLoading.value = true
    try {
      const response = await api.get('/documents/user/marko456')
      documents.value = response.data
    } catch (error) {
      errorMessage.value = error?.response?.data?.message || 'Došlo je do greške pri učitavanju dokumenata.'
    } finally {
      isLoading.value = false
    }
  }
  
  function back() {
    router.back()
  }
  
  onMounted(() => {
    fetchDocuments()
  })
  </script>
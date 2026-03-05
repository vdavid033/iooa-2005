<template>
  <q-dialog v-model="dialogOpen">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Upload dokumenta</div>
      </q-card-section>
      <q-card-section>
        <q-file
          v-model="fileToUpload"
          label="Odaberi dokument"
          outlined
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Odustani" color="primary" @click="close" />
        <q-btn flat label="Upload" color="primary" :disable="!fileToUpload" @click="submitUpload" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

defineOptions({
  name: 'UploadDocumentDialog',
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'upload'])
const dialogOpen = ref(false)
const fileToUpload = ref(null)

watch(
  () => props.modelValue,
  (value) => {
    dialogOpen.value = value
    if (value) {
      fileToUpload.value = null
    }
  }
)

watch(dialogOpen, (value) => {
  emit('update:modelValue', value)
})

function close() {
  dialogOpen.value = false
}

function submitUpload() {
  if (!fileToUpload.value) return
  emit('upload', fileToUpload.value)
  dialogOpen.value = false
}
</script>

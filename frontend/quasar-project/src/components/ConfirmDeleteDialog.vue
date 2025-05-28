<template>
  <q-dialog v-model="dialogVisible">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Potvrda brisanja</div>
      </q-card-section>
      <q-card-section>
        <div>Jeste li sigurni da želite obrisati mapu "{{ folder?.ime_mape }}"?</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Odustani" color="grey-6" v-close-popup />
        <q-btn color="negative" label="Obriši" @click="confirmDelete" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

defineOptions({ name: 'ConfirmDeleteDialog' })

const props = defineProps({
  modelValue: Boolean,
  folder: Object,
})

const emit = defineEmits(['update:modelValue', 'confirm'])
const dialogVisible = ref(false)

watch(
  () => props.modelValue,
  (value) => {
    dialogVisible.value = value
  }
)

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

function confirmDelete() {
  emit('confirm', props.folder)
  dialogVisible.value = false
}
</script>

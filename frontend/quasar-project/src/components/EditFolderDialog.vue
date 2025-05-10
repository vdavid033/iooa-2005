<template>
  <q-dialog v-model="dialogVisible">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Preimenuj mapu</div>
      </q-card-section>
      <q-card-section>
        <div class="q-mb-md">
          <q-input v-model="name" label="Novi naziv mape" dense autofocus />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Odustani" color="grey-6" v-close-popup />
        <q-btn color="positive" label="Spremi" @click="confirmEdit" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

defineOptions({ name: 'EditFolderDialog.vue' })

const props = defineProps({
  modelValue: Boolean,
  folder: Object,
})

const emit = defineEmits(['update:modelValue', 'save'])
const dialogVisible = ref(false)
const name = ref('')

watch(
  () => props.modelValue,
  (value) => {
    dialogVisible.value = value
    if (value) {
      name.value = props.folder?.ime_mape || ''
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

function confirmEdit() {
  emit('save', {
    ...props.folder,
    ime_mape: name.value,
  })
  dialogVisible.value = false
}
</script>

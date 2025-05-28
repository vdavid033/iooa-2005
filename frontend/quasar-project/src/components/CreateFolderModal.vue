<template>
  <q-dialog v-model="dialogOpen">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">
          {{ !parentId ? 'Kreiraj kolegij' : 'Kreiraj podmapu' }}
        </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="submit">
          <div class="q-mb-md">
            <q-input
              v-model="folderName"
              label="Naziv mape"
              dense
              outlined
              :rules="[(val) => !!val || 'Naziv mape je obavezan']"
              autofocus
            />
          </div>
          <div class="q-mb-md" v-if="parentId">
            <q-select
              v-model="kolegijName"
              :options="kolegiji"
              label="Kolegij"
              dense
              outlined
              readonly
            />
          </div>
          <div class="row justify-end q-gutter-sm">
            <q-btn flat label="Odustani" color="grey-6" @click="close" />
            <q-btn unelevated label="Spremi" color="positive" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

defineOptions({
  name: 'CreateFolderModal',
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  parentId: {
    type: [Number, String],
    default: null,
  },
  kolegiji: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'create'])

const dialogOpen = ref(false)
const folderName = ref('')
const kolegijName = ref('')

watch(
  () => props.modelValue,
  (value) => {
    dialogOpen.value = value
    if (value) {
      folderName.value = ''
      kolegijName.value = ''

      if (props.parentId && props.kolegiji.length) {
        const found = props.kolegiji.find((k) => k.id_mape === Number(props.parentId))
        kolegijName.value = found?.ime_mape || 'Nepoznat kolegij'
      }
    }
  }
)

watch(dialogOpen, (value) => {
  emit('update:modelValue', value)
})

function close() {
  dialogOpen.value = false
}

function submit() {
  emit('create', {
    name: folderName.value,
    parentId: props.parentId ?? null,
  })
  dialogOpen.value = false
}
</script>

<template>
  <q-dialog v-model="dialogOpen">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Kreiraj novu mapu</div>
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
          <div class="q-mb-md" v-if="!hideParentSelect">
            <q-select
              v-model="selectedParentId"
              :options="parentOptions"
              label="Parent mapa"
              option-value="id"
              option-label="name"
              dense
              outlined
              emit-value
              map-options
              readonly
            />
          </div>
          <div class="q-mb-md">
            <q-select
              v-model="selectedKolegijId"
              :options="kolegijiOptions"
              label="Kolegij"
              option-value="id"
              option-label="name"
              dense
              outlined
              emit-value
              map-options
              :readonly="forcedParentId !== null"
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
import { computed, ref, watch } from 'vue'

defineOptions({
  name: 'CreateFolderModal',
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  parentFolders: {
    type: Array,
    default: () => [],
  },
  kolegiji: {
    type: Array,
    default: () => [],
  },
  forcedParentId: {
    type: [String, Number],
    default: null,
  },
  forcedKolegijId: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'create'])

const dialogOpen = ref(false)
const folderName = ref('')
const selectedParentId = ref(null)
const selectedKolegijId = ref(null)
const parentOptions = ref([])
const kolegijiOptions = ref([])
const hideParentSelect = computed(() => props.forcedParentId === null)

watch(
  () => props.modelValue,
  (value) => {
    dialogOpen.value = value
    if (value) {
      folderName.value = ''
      kolegijiOptions.value = props.kolegiji.map((k) => ({
        id: k.id,
        name: k.naziv,
      }))
      parentOptions.value = props.parentFolders.map((f) => ({
        id: f.id_mape,
        name: f.ime_mape,
      }))

      if (props.forcedParentId !== null) {
        selectedParentId.value = props.forcedParentId
      } else {
        selectedParentId.value = null
      }

      if (props.forcedKolegijId !== null) {
        selectedKolegijId.value = props.forcedKolegijId
      } else {
        selectedKolegijId.value = null
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
    parentId: selectedParentId?.value?.id_mape || null,
    kolegijId: selectedKolegijId.value,
  })
  dialogOpen.value = false
}
</script>

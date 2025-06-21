<template>
  <div>
    <!-- File list -->
    <q-table :rows="files" :columns="columns" row-key="id_dokumenta" flat bordered>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="download" flat round dense @click="downloadDocument(props.row)" />
          <q-btn
            v-if="isAdmin"
            icon="delete"
            flat
            round
            dense
            @click="confirmDelete(props.row)"
            class="q-ml-sm"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Delete confirmation dialog -->
    <q-dialog v-model="showDeleteConfirm">
      <q-card>
        <q-card-section>
          <div class="text-h6">Brisanje dokumenta</div>
          <div class="q-mt-sm">
            Jeste li sigurni da želite obrisati dokument "{{ documentToDelete?.ime_dokumenta }}"?
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" color="primary" v-close-popup />
          <q-btn flat label="Obriši" color="negative" @click="deleteDocument" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

const props = defineProps({
  files: {
    type: Array,
    default: () => [],
  },
  folderId: {
    type: [String, Number],
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh'])

const $q = useQuasar()
const showDeleteConfirm = ref(false)
const documentToDelete = ref(null)

const columns = [
  {
    name: 'ime_dokumenta',
    required: true,
    label: 'Naziv dokumenta',
    align: 'left',
    field: (row) => row.ime_dokumenta,
    sortable: true,
  },
  {
    name: 'datum_kreiranja',
    label: 'Datum kreiranja',
    field: (row) => new Date(row.datum_kreiranja).toLocaleString(),
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Akcije',
    field: '',
    align: 'right',
  },
]

function downloadDocument(document) {
  window.open(`/api/documents/download/${document.id_dokumenta}`, '_blank')
}

function confirmDelete(document) {
  documentToDelete.value = document
  showDeleteConfirm.value = true
}

async function deleteDocument() {
  try {
    await api.delete(`/documents/${documentToDelete.value.id_dokumenta}`)

    $q.notify({
      type: 'positive',
      message: 'Dokument uspješno obrisan',
    })

    showDeleteConfirm.value = false
    emit('refresh')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Greška pri brisanju dokumenta',
    })
    console.error(error)
  }
}
</script>

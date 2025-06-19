<template>
  <q-page class="q-pa-md">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6">Prijavljene objave</div>
      </q-card-section>

      <q-table
        :rows="reports"
        :columns="columns"
        row-key="ID_Prijava"
        flat
        bordered
        separator="horizontal"
        :loading="loading"
        no-data-label="Nema prijava"
      >
        <template v-slot:body-cell-actions="props">
          <q-td align="center">
            <q-btn flat icon="visibility" @click="goToPost(props.row.ID_Objava)" />
            <q-btn flat icon="visibility_off" color="primary" @click="ignoreReport(props.row.ID_Prijava)" />
            <q-btn flat icon="delete" color="negative" @click="deletePost(props.row.ID_Prijava)" />
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUser } from 'src/composables/useUser'

const router = useRouter()
const $q = useQuasar()
const { isAdmin, loadUserFromToken } = useUser()

const reports = ref([])
const loading = ref(true)

const columns = [
  { name: 'ID_Prijava', label: 'ID', field: 'ID_Prijava', align: 'left' },
  { name: 'korisnicko_ime', label: 'Korisnik', field: 'korisnicko_ime', align: 'left' },
  { name: 'razlog_prijave', label: 'Razlog', field: 'razlog_prijave', align: 'left' },
  { name: 'opis_prijave', label: 'Opis', field: 'opis_prijave', align: 'left' },
  { name: 'datum_prijave', label: 'Datum', field: 'datum_prijave', align: 'left' },
  { name: 'actions', label: 'Akcije', field: 'actions', align: 'center', sortable: false }
]

function goToPost(postId) {
  router.push(`/objava/${postId}`)
}

async function ignoreReport(prijavaId) {
  try {
    const token = localStorage.getItem('token')
    await axios.post(`http://localhost:3000/api/admin/reports/${prijavaId}/ignore`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    $q.notify({ type: 'positive', message: 'Prijava je ignorirana.' })
    await loadReports()
  } catch (err) {
    console.error('Greška pri ignoriranju:', err)
    $q.notify({ type: 'negative', message: 'Greška pri ignoriranju prijave.' })
  }
}

async function deletePost(prijavaId) {
  try {
    const token = localStorage.getItem('token')
    await axios.post(`http://localhost:3000/api/admin/reports/${prijavaId}/delete-post`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    $q.notify({ type: 'positive', message: 'Objava je obrisana.' })
    await loadReports()
  } catch (err) {
    console.error('Greška pri brisanju objave:', err)
    $q.notify({ type: 'negative', message: 'Greška pri brisanju objave.' })
  }
}

async function loadReports() {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3000/api/admin/reports', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    reports.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Greška pri dohvaćanju prijava:', err)
    $q.notify({ type: 'negative', message: 'Greška pri učitavanju prijava.' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadUserFromToken()
  if (!isAdmin()) {
    router.push('/')
    return
  }
  await loadReports()
})
</script>

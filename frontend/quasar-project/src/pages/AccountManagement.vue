<template>
  <q-page class="q-pa-md" style="position: relative; overflow: hidden">
    <div class="background-image absolute-full"></div>

    <div class="q-mb-auto q-mt-md" style="padding-left: 10px; padding-bottom: 1rem;">
      <img
        alt="Veleri logo"
        src="~assets/Veleuciliste-u-Rijeci-Logo.png"
        style="width: 240px"
      />
    </div>

    <div class="column full-height" style="max-width: 80%; margin-left: 10px; flex: 1;">
      <div v-if="loading">Učitavanje korisnika...</div>
      <div v-else-if="error" style="color: red;">{{ error }}</div>

      <div v-else>
        <div style="margin-bottom: 1.5rem;">
          <label for="search"><b>Pretraži korisnike:</b></label>
          <input
            id="search"
            v-model="filter"
            :disabled="loading"
            placeholder="Upišite tekst..."
            style="width: 100%; padding: 6px; box-sizing: border-box;"
          />
        </div>

        <div v-if="waitingUsers.length > 0" class="mb-6">
          <h5>Čeka na odobrenje</h5>
          <div>
            <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th class="bordered fixed-col" style="width: 60px;">ID</th>
                  <th class="bordered fixed-col" style="width: 100px;">Ime</th>
                  <th class="bordered fixed-col" style="width: 120px;">Prezime</th>
                  <th class="bordered fixed-col" style="width: 120px;">Korisničko</th>
                  <th class="bordered fixed-col" style="width: 100px;">JMBAG</th>
                  <th class="bordered fixed-col" style="width: 180px;">Email</th>
                  <th class="bordered fixed-col" style="width: 100px;">Telefon</th>
                  <th class="bordered" style="width: 140px;">Adresa</th>
                  <th class="bordered fixed-col" style="width: 120px;">Datum</th>
                  <th class="bordered fixed-col" style="width: 90px;">Zaključan</th>
                  <th class="bordered fixed-col" style="width: 80px;">Admin</th>
                  <th class="akcija-col" style="width: 160px;"></th>
                  <th class="akcija-col" style="width: 160px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in waitingUsers" :key="u.id_korisnika">
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.id_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.ime_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.prezime_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.korisnicko_ime }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.jmbag_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.email || '-' }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.telefon || '-' }}</td>
                  <td class="bordered" style="background-color: #fff0e6;">{{ u.adresa || '-' }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.datum_kreiranja || '-' }}</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">Ne</td>
                  <td class="bordered fixed-col" style="background-color: #fff0e6;">{{ u.admin_status === 1 ? 'Da' : 'Ne' }}</td>
                  <td class="akcija-col">
                    <q-btn
                      label="Odobri"
                      color="secondary"
                      dense
                      unelevated
                      style="min-width: 120px; padding: 10px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer;"
                      :loading="processing.has(u.id_korisnika)"
                      :disable="processing.has(u.id_korisnika)"
                      @click="toggleLock(u)"
                    />
                  </td>
                  <td class="akcija-col"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-if="lockedUsers.length > 0" class="mb-6">
          <h5>Zaključani korisnici</h5>
          <div>
            <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th class="bordered fixed-col" style="width: 60px;">ID</th>
                  <th class="bordered fixed-col" style="width: 100px;">Ime</th>
                  <th class="bordered fixed-col" style="width: 120px;">Prezime</th>
                  <th class="bordered fixed-col" style="width: 120px;">Korisničko</th>
                  <th class="bordered fixed-col" style="width: 100px;">JMBAG</th>
                  <th class="bordered fixed-col" style="width: 180px;">Email</th>
                  <th class="bordered fixed-col" style="width: 100px;">Telefon</th>
                  <th class="bordered" style="width: 140px;">Adresa</th>
                  <th class="bordered fixed-col" style="width: 120px;">Datum</th>
                  <th class="bordered fixed-col" style="width: 90px;">Zaključan</th>
                  <th class="bordered fixed-col" style="width: 80px;">Admin</th>
                  <th class="akcija-col" style="width: 160px;"></th>
                  <th class="akcija-col" style="width: 160px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in lockedUsers" :key="u.id_korisnika">
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.id_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.ime_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.prezime_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.korisnicko_ime }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.jmbag_korisnika }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.email || '-' }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.telefon || '-' }}</td>
                  <td class="bordered" style="background-color: #ffe6e6;">{{ u.adresa || '-' }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.datum_kreiranja || '-' }}</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">Da</td>
                  <td class="bordered fixed-col" style="background-color: #ffe6e6;">{{ u.admin_status === 1 ? 'Da' : 'Ne' }}</td>
                  <td class="akcija-col">
                    <q-btn
                      label="Otključaj"
                      color="secondary"
                      dense
                      unelevated
                      style="min-width: 120px; padding: 10px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer;"
                      :loading="processing.has(u.id_korisnika)"
                      :disable="processing.has(u.id_korisnika)"
                      @click="toggleLock(u)"
                    />
                  </td>
                  <td class="akcija-col"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h5>Pregled korisnika</h5>
          <div>
            <table cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th class="bordered fixed-col" style="width: 60px;">ID</th>
                  <th class="bordered fixed-col" style="width: 100px;">Ime</th>
                  <th class="bordered fixed-col" style="width: 120px;">Prezime</th>
                  <th class="bordered fixed-col" style="width: 120px;">Korisničko</th>
                  <th class="bordered fixed-col" style="width: 100px;">JMBAG</th>
                  <th class="bordered fixed-col" style="width: 180px;">Email</th>
                  <th class="bordered fixed-col" style="width: 100px;">Telefon</th>
                  <th class="bordered" style="width: 140px;">Adresa</th>
                  <th class="bordered fixed-col" style="width: 120px;">Datum</th>
                  <th class="bordered fixed-col" style="width: 90px;">Zaključan</th>
                  <th class="bordered fixed-col" style="width: 80px;">Admin</th>
                  <th class="akcija-col" style="width: 160px;"></th>
                  <th class="akcija-col" style="width: 160px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in unlockedUsers" :key="u.id_korisnika">
                  <td class="bordered fixed-col">{{ u.id_korisnika }}</td>
                  <td class="bordered fixed-col">{{ u.ime_korisnika }}</td>
                  <td class="bordered fixed-col">{{ u.prezime_korisnika }}</td>
                  <td class="bordered fixed-col">{{ u.korisnicko_ime }}</td>
                  <td class="bordered fixed-col">{{ u.jmbag_korisnika }}</td>
                  <td class="bordered fixed-col">{{ u.email || '-' }}</td>
                  <td class="bordered fixed-col">{{ u.telefon || '-' }}</td>
                  <td class="bordered">{{ u.adresa || '-' }}</td>
                  <td class="bordered fixed-col">{{ u.datum_kreiranja || '-' }}</td>
                  <td class="bordered fixed-col">Ne</td>
                  <td class="bordered fixed-col">{{ u.admin_status === 1 ? 'Da' : 'Ne' }}</td>
                  <td class="akcija-col">
                    <q-btn
                      label="Zaključaj"
                      color="red"
                      dense
                      unelevated
                      style="min-width: 120px; padding: 10px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer;"
                      :loading="processing.has(u.id_korisnika)"
                      :disable="processing.has(u.id_korisnika)"
                      @click="toggleLock(u)"
                    />
                  </td>
                  <td class="akcija-col">
                    <q-btn
                      label="Reset lozinke"
                      color="primary"
                      dense
                      unelevated
                      style="min-width: 150px; padding: 10px 20px; font-weight: 600; font-size: 0.9rem; cursor: pointer;"
                      :loading="processing.has(u.id_korisnika)"
                      :disable="processing.has(u.id_korisnika)"
                      @click="resetPassword(u)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { useUser } from 'src/composables/useUser'

const $q = useQuasar()
const { user } = useUser()

const users = ref([])
const filter = ref('')
const loading = ref(false)
const error = ref(null)
const processing = ref(new Set())

const loggedInUserId = computed(() => user.value?.id)

async function loadUsers() {
  loading.value = true
  error.value = null
  try {
    const { data } = await axios.get('http://localhost:3000/adminAccountCheck')
    if (data.error === false) {
      users.value = data.users.filter(u => u.id_korisnika !== loggedInUserId.value)
    } else {
      error.value = data.message
    }
  } catch (e) {
    console.error('[Frontend] loadUsers error', e)
    error.value = 'Greška na serveru.'
  } finally {
    loading.value = false
  }
}

function stringify(u) {
  return Object.values(u)
    .map(v => String(v).toLowerCase())
    .join(',')
}

const waitingUsers = computed(() =>
  users.value.filter(u => u.zakljucan === -1)
    .filter(u => stringify(u).includes(filter.value.toLowerCase()))
)

const lockedUsers = computed(() =>
  users.value.filter(u => u.zakljucan === 1)
    .filter(u => stringify(u).includes(filter.value.toLowerCase()))
)

const unlockedUsers = computed(() =>
  users.value.filter(u => u.zakljucan === 0)
    .filter(u => stringify(u).includes(filter.value.toLowerCase()))
)

async function toggleLock(u) {
  const id = u.id_korisnika
  const next = (u.zakljucan === 0) ? 1 : 0

  if (processing.value.has(id)) return
  addProcessing(id)

  try {
    const { data } = await axios.put(
      `http://localhost:3000/adminAccountCheck/${id}/lock`,
      { lock: next }
    )

    if (data.error === false) {
      u.zakljucan = next
      $q.notify({
        type: next === 1 ? 'negative' : 'positive',
        message: `Korisnik ${u.korisnicko_ime} je ${next === 1 ? 'zaključan' : 'otključan'}.`,
        position: 'top'
      })
    } else {
      $q.notify({ type: 'negative', message: data.message, position: 'top' })
    }
  } catch (err) {
    console.error('[Frontend] toggleLock error', err)
    $q.notify({ type: 'negative', message: 'Greška na serveru.', position: 'top' })
  } finally {
    removeProcessing(id)
  }
}

async function resetPassword(u) {
  const id = u.id_korisnika
  if (processing.value.has(id)) return
  if (!confirm(`Jeste li sigurni da želite resetirati lozinku korisnika ${u.korisnicko_ime}?`)) return

  addProcessing(id)
  try {
    const { data } = await axios.put(
      `http://localhost:3000/adminAccountCheck/${id}/resetPassword`
    )
    if (data.error === false) {
      $q.notify({ type: 'positive', message: `Lozinka korisnika ${u.korisnicko_ime} resetirana.`, position: 'top' })
    } else {
      $q.notify({ type: 'negative', message: data.message || 'Greška pri resetiranju lozinke.', position: 'top' })
    }
  } catch (err) {
    console.error('[Frontend] resetPassword error', err)
    $q.notify({ type: 'negative', message: 'Greška na serveru.', position: 'top' })
  } finally {
    removeProcessing(id)
  }
}

function addProcessing(id) {
  const set = new Set(processing.value)
  set.add(id)
  processing.value = set
}

function removeProcessing(id) {
  const set = new Set(processing.value)
  set.delete(id)
  processing.value = set
}

onMounted(loadUsers)
</script>

<style scoped>
.background-image {
  background-image: url('/velerilogo.png');
  opacity: 0.25;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  position: absolute;
  inset: 0;
  z-index: -1;
}

.bordered {
  border: 1px solid #ccc;
}

td.akcija-col {
  border: none !important;
}
</style>

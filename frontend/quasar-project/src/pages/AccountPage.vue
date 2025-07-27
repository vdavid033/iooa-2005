<template>
  <q-page class="q-pa-md" style="position: relative; overflow: hidden;">

    <div class="background-image absolute-full"></div>

    <div class="column full-height">

      <div class="q-mb-auto q-mt-md" style="text-align: left; padding-left: 50px">
        <img
          alt="Veleri logo"
          src="~assets/Veleuciliste-u-Rijeci-Logo.png"
          style="width: 240px; height: auto"
        />
      </div>

      <div class="row items-center justify-center q-gutter-xl" style="flex: 1">
        <div class="column justify-center" style="max-width: 650px;"> <!-- proširena širina ovdje -->

          <!-- Profilna slika ili default ikona -->
          <div style="text-align: center; margin-bottom: 1rem;">
            <template v-if="hasProfilePhoto">
              <img
                :src="profilePhotoUrl"
                alt="Profilna slika korisnika"
                style="max-width: 195px; max-height: 195px; border-radius: 50%; object-fit: cover; border: 1px solid #ccc;"
                @error="onImgError"
              />
            </template>
            <template v-else>
              <q-icon name="person" size="195px" color="primary" />
            </template>

            <div class="q-mt-sm">
              <template v-if="isUploading">
                <q-btn
                  label="Spremi"
                  color="primary"
                  dense
                  class="q-mr-sm"
                  :loading="loading"
                  :disable="loading"
                  @click="submitProfilePicture"
                />
                <q-btn
                  label="Odbaci"
                  color="secondary"
                  dense
                  @click="discardProfilePicture"
                />
              </template>

              <template v-else-if="isDeleteConfirm">
                <q-btn
                  label="Potvrdi"
                  color="negative"
                  dense
                  class="q-mr-sm"
                  :loading="loading"
                  :disable="loading"
                  @click="confirmDeleteProfilePicture"
                />
                <q-btn
                  label="Odustani"
                  color="secondary"
                  dense
                  @click="cancelDeleteProfilePicture"
                />
              </template>

              <template v-else-if="hasProfilePhoto">
                <q-btn
                  label="Promijeni sliku profila"
                  color="primary"
                  dense
                  class="q-mr-sm"
                  @click="onChangeProfilePhoto"
                />
                <q-btn
                  label="Obriši sliku"
                  color="negative"
                  dense
                  @click="startDeleteConfirmation"
                />
              </template>

              <q-btn
                v-else
                label="Postavi sliku profila"
                color="primary"
                dense
                @click="onChangeProfilePhoto"
              />
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onFileChange"
            />
          </div>

          <!-- Polja za korisničke podatke -->
          <q-input
            v-model="ime"
            :readonly="fieldsLocked"
            label="Ime"
            outlined
            class="q-mb-md"
            :class="{ 'readonly-field': fieldsLocked }"
            style="max-width: 510px;"
          />
          <q-input
            v-model="prezime"
            :readonly="fieldsLocked"
            label="Prezime"
            outlined
            class="q-mb-md"
            :class="{ 'readonly-field': fieldsLocked }"
            style="max-width: 510px;"
          />
          <q-input
            v-model="korisnicko_ime"
            :readonly="fieldsLocked"
            label="Korisničko ime"
            outlined
            class="q-mb-md"
            :class="{ 'readonly-field': fieldsLocked }"
            style="max-width: 510px;"
          />
          <q-input
            v-model="jmbag"
            :readonly="fieldsLocked"
            label="JMBAG"
            outlined
            class="q-mb-md"
            :class="{ 'readonly-field': fieldsLocked }"
            style="max-width: 510px;"
          />
          <q-input
            v-model="email"
            :readonly="fieldsLocked"
            label="Email"
            type="email"
            outlined
            class="q-mb-md"
            :class="{ 'readonly-field': fieldsLocked }"
            :rules="[val => !!val || 'Email je obavezan', val => /.+@.+\..+/.test(val) || 'Neispravan format emaila']"
            style="max-width: 510px;"
          />
          <q-input
            v-model="telefon"
            :readonly="fieldsLocked"
            label="Telefon"
            outlined
            class="q-mb-md"
            :class="{ 'readonly-field': fieldsLocked }"
            style="max-width: 510px;"
          />
          <q-input
            v-model="adresa"
            :readonly="fieldsLocked"
            label="Adresa"
            outlined
            class="q-mb-md"
            :class="{ 'readonly-field': fieldsLocked }"
            style="max-width: 510px;"
          />

          <!-- Gumb za promjenu/shrani podatke -->
          <q-btn
            :label="fieldsLocked ? 'Promijeni podatke' : 'Spremi promjene'"
            color="primary"
            class="full-width q-mt-md"
            @click="fieldsLocked ? unlockFields() : updateUser()"
            :loading="loading"
            :disable="loading"
          />

          <!-- Gumb za prikaz polja za promjenu lozinke -->
          <q-btn
            label="Promijeni lozinku"
            color="secondary"
            class="full-width q-mt-sm"
            @click="toggleChangePasswordFields"
          />

          <!-- Polja za promjenu lozinke (prikazuju se samo ako korisnik to želi) -->
          <div v-if="showChangePassword" class="q-mt-md" style="max-width: 510px;">
            <q-input
              v-model="oldPassword"
              label="Trenutna lozinka"
              type="password"
              outlined
              dense
              class="q-mb-md"
            />
            <q-input
              v-model="newPassword"
              label="Nova lozinka"
              type="password"
              outlined
              dense
              class="q-mb-md"
            />
            <q-btn
              label="Spremi novu lozinku"
              color="primary"
              :loading="loadingChangePassword"
              :disable="loadingChangePassword"
              @click="changePassword"
              class="full-width"
            />
          </div>

        </div>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUser } from 'src/composables/useUser'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const { user, isAuthenticated } = useUser()

// Polja korisnika
const ime = ref('')
const prezime = ref('')
const korisnicko_ime = ref('')
const jmbag = ref('')
const email = ref('')
const telefon = ref('')
const adresa = ref('')

// Profilna slika i stanje
const profilePhotoUrl = ref('')
const loading = ref(false)
const fieldsLocked = ref(true)

const placeholderUrl = '/uploads/png-transparent-default-avatar.png'

const hasProfilePhoto = computed(() => profilePhotoUrl.value && profilePhotoUrl.value !== placeholderUrl)

// Upload polja
const fileInput = ref(null)
const selectedFile = ref(null)
const isUploading = ref(false)
const isDeleteConfirm = ref(false)

// Lozinka polja i stanje
const showChangePassword = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const loadingChangePassword = ref(false)

function onImgError(event) {
  event.target.src = placeholderUrl
}

function unlockFields() {
  fieldsLocked.value = false
}

function lockFields() {
  fieldsLocked.value = true
}

function onChangeProfilePhoto() {
  fileInput.value.click()
}

function onFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    profilePhotoUrl.value = URL.createObjectURL(file)
    isUploading.value = true
    isDeleteConfirm.value = false
  }
}

function discardProfilePicture() {
  selectedFile.value = null
  isUploading.value = false

  if (fileInput.value) {
    fileInput.value.value = null
  }

  fetchUserData()
}

async function submitProfilePicture() {
  if (!selectedFile.value) return

  loading.value = true
  try {
    const userId = user.value?.id
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Korisnik nije prijavljen.' })
      router.push('/login')
      return
    }

    const formData = new FormData()
    formData.append('ime', ime.value)
    formData.append('prezime', prezime.value)
    formData.append('korisnicko_ime', korisnicko_ime.value)
    formData.append('jmbag', jmbag.value)
    formData.append('email', email.value)
    formData.append('telefon', telefon.value)
    formData.append('adresa', adresa.value)
    formData.append('slika_url', selectedFile.value)

    const response = await axios.put(`http://localhost:3000/accountUpdate/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.data && response.data.error === false) {
      $q.notify({ type: 'positive', message: 'Slika profila uspješno promijenjena' })
      selectedFile.value = null
      isUploading.value = false

      if (fileInput.value) {
        fileInput.value.value = null
      }

      if (response.data.profile_photo_url) {
        profilePhotoUrl.value = `http://localhost:3000${response.data.profile_photo_url}`
      }
    } else {
      $q.notify({ type: 'negative', message: response.data.message || 'Nepoznata greška prilikom ažuriranja slike profila.' })
      discardProfilePicture()
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Greška prilikom ažuriranja slike profila.' })
    discardProfilePicture()
  } finally {
    loading.value = false
  }
}

function startDeleteConfirmation() {
  isDeleteConfirm.value = true
  isUploading.value = false
  selectedFile.value = null

  if (fileInput.value) {
    fileInput.value.value = null
  }
}

function cancelDeleteProfilePicture() {
  isDeleteConfirm.value = false
}

async function confirmDeleteProfilePicture() {
  // Za sada koristimo confirm(); može se zamijeniti modalom iz Quasara po želji
  if (!confirm('Jeste li sigurni da želite obrisati profilnu sliku?')) return

  loading.value = true
  try {
    const userId = user.value?.id
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Korisnik nije prijavljen.' })
      router.push('/login')
      return
    }

    const response = await axios.delete(`http://localhost:3000/accountUpdate/${userId}/photo`)

    if (response.data && response.data.error === false) {
      $q.notify({ type: 'positive', message: 'Profilna slika uspješno obrisana.' })
      isDeleteConfirm.value = false
      await fetchUserData()
    } else {
      $q.notify({ type: 'negative', message: response.data.message || 'Greška prilikom brisanja profilne slike.' })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Greška prilikom brisanja profilne slike.' })
  } finally {
    loading.value = false
  }
}

async function fetchUserData() {
  try {
    const userId = user.value?.id
    if (!userId) return

    const response = await axios.get(`http://localhost:3000/accountUpdate/${userId}`)
    if (response.data && !response.data.error) {
      const userData = response.data.user

      ime.value = userData.ime_korisnika || ''
      prezime.value = userData.prezime_korisnika || ''
      korisnicko_ime.value = userData.korisnicko_ime || ''
      jmbag.value = userData.jmbag_korisnika || ''
      email.value = userData.email || ''
      telefon.value = userData.telefon || ''
      adresa.value = userData.adresa || ''

      if (userData.slika_url) {
        profilePhotoUrl.value = `http://localhost:3000${userData.slika_url}`
      } else {
        profilePhotoUrl.value = placeholderUrl
      }

      lockFields()
    } else {
      $q.notify({ type: 'negative', message: response.data?.message || 'Nepoznata greška prilikom dohvaćanja podataka korisnika.' })
      profilePhotoUrl.value = placeholderUrl
    }
  } catch (err) {
    console.error('Greška pri dohvaćanju podataka:', err)
    $q.notify({ type: 'negative', message: 'Greška pri dohvaćanju podataka s poslužitelja.' })
    profilePhotoUrl.value = placeholderUrl
  }
}

onMounted(() => {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }
  fetchUserData()
})

async function updateUser() {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }

  const emailValue = email.value.trim()
  if (!emailValue) {
    $q.notify({ type: 'negative', message: 'Email je obavezan' })
    return
  }
  if (!/.+@.+\..+/.test(emailValue)) {
    $q.notify({ type: 'negative', message: 'Neispravan format emaila' })
    return
  }

  loading.value = true
  try {
    const userId = user.value?.id
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Korisnik nije prijavljen.' })
      router.push('/login')
      return
    }

    const payload = {
      ime: ime.value,
      prezime: prezime.value,
      korisnicko_ime: korisnicko_ime.value,
      jmbag: jmbag.value,
      email: emailValue,
      telefon: telefon.value,
      adresa: adresa.value
    }

    const response = await axios.put(`http://localhost:3000/accountUpdate/${userId}`, payload)

    if (response.data && response.data.error === false) {
      $q.notify({ type: 'positive', message: 'Podaci uspješno ažurirani.' })
      lockFields()
    } else {
      $q.notify({ type: 'negative', message: response.data.message || 'Nepoznata greška prilikom ažuriranja podataka.' })
    }
  } catch (err) {
    console.error('Update error:', err)
    $q.notify({ type: 'negative', message: 'Greška pri ažuriranju podataka: ' + (err.response?.data?.message || err.message) })
  } finally {
    loading.value = false
  }
}

function toggleChangePasswordFields() {
  showChangePassword.value = !showChangePassword.value
  // Clear password fields when toggling
  oldPassword.value = ''
  newPassword.value = ''
}

async function changePassword() {
  if (!oldPassword.value || !newPassword.value) {
    $q.notify({ type: 'negative', message: 'Molimo unesite i staru i novu lozinku.' })
    return
  }
  if (newPassword.value.length < 6) {
    $q.notify({ type: 'negative', message: 'Nova lozinka mora imati najmanje 6 znakova.' })
    return
  }

  loadingChangePassword.value = true
  try {
    const userId = user.value?.id
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Korisnik nije prijavljen.' })
      router.push('/login')
      return
    }

    const response = await axios.put(`http://localhost:3000/accountUpdate/${userId}/changePassword`, {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })

    if (response.data && response.data.error === false) {
      $q.notify({ type: 'positive', message: 'Lozinka je uspješno promijenjena.' })
      showChangePassword.value = false
      oldPassword.value = ''
      newPassword.value = ''
    } else {
      $q.notify({ type: 'negative', message: response.data.message || 'Greška pri promjeni lozinke.' })
    }
  } catch (err) {
    console.error(err)
    const msg = err.response?.data?.message || 'Greška pri promjeni lozinke.'
    $q.notify({ type: 'negative', message: msg })
} finally {
    loadingChangePassword.value = false
  }
}

</script>

<style scoped>
.background-image {
  background-image: url('/velerilogo.png');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  opacity: 0.25;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.readonly-field input {
  background-color: #f5f5f5;
  cursor: pointer;
}
</style>

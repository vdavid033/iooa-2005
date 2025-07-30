<template>
  <q-page class="q-pa-md" style="position: relative; overflow: hidden;">
    <div class="background-image absolute-full"></div>

    <div class="row q-px-xl" style="height: 100%; gap: 32px;">
      <div style="min-width: 240px; display: flex; flex-direction: column; align-items: center;">
        <img
          alt="Veleri logo"
          src="~assets/Veleuciliste-u-Rijeci-Logo.png"
          style="width: 240px; height: auto; margin-bottom: 1rem;"
        />

        <div
          style="width: 195px; height: 195px; border: 1px solid #ccc; border-radius: 50%; overflow: hidden; display: flex; justify-content: center; align-items: center;"
        >
          <template v-if="hasProfilePhoto">
            <img
              :src="profilePhotoUrl"
              alt="Profilna slika korisnika"
              style="width: 195px; height: 195px; object-fit: cover;"
              @error="onImgError"
            />
          </template>
          <template v-else>
            <q-icon name="person" size="195px" color="primary" />
          </template>
        </div>

        <div class="q-mt-sm" style="text-align: center; width: 195px;">
          <template v-if="isUploading">
            <q-btn
              label="Spremi"
              color="primary"
              dense
              class="q-mb-xs"
              :loading="loading"
              :disable="loading"
              @click="submitProfilePicture"
              style="width: 100%;"
            />
            <q-btn
              label="Odbaci"
              color="secondary"
              dense
              style="width: 100%;"
              @click="discardProfilePicture"
            />
          </template>

          <template v-else-if="isDeleteConfirm">
            <q-btn
              label="Potvrdi"
              color="negative"
              dense
              class="q-mb-xs"
              :loading="loading"
              :disable="loading"
              @click="confirmDeleteProfilePicture"
              style="width: 100%;"
            />
            <q-btn
              label="Odustani"
              color="secondary"
              dense
              style="width: 100%;"
              @click="cancelDeleteProfilePicture"
            />
          </template>

          <template v-else-if="hasProfilePhoto">
            <q-btn
              label="Promijeni sliku profila"
              color="primary"
              dense
              class="q-mb-xs"
              style="width: 100%;"
              @click="onChangeProfilePhoto"
            />
            <q-btn
              label="Obriši sliku"
              color="negative"
              dense
              style="width: 100%;"
              @click="startDeleteConfirmation"
            />
          </template>

          <q-btn
            v-else
            label="Postavi sliku profila"
            color="primary"
            dense
            style="width: 100%; margin-top: 0.25rem;"
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

      <div style="flex: 1; max-width: 600px; display: flex; flex-direction: column;">
        <h2 class="text-h5 text-primary q-mb-md">Moji podaci</h2>

        <q-input v-model="ime" :readonly="fieldsLocked" label="Ime" outlined class="q-mb-md" :class="{ 'readonly-field': fieldsLocked }" />
        <q-input v-model="prezime" :readonly="fieldsLocked" label="Prezime" outlined class="q-mb-md" :class="{ 'readonly-field': fieldsLocked }" />
        <q-input v-model="korisnicko_ime" :readonly="fieldsLocked" label="Korisničko ime" outlined class="q-mb-md" :class="{ 'readonly-field': fieldsLocked }" />
        <q-input v-model="jmbag" :readonly="fieldsLocked" label="JMBAG" outlined class="q-mb-md" :class="{ 'readonly-field': fieldsLocked }" :rules="jmbagRules" />
        <q-input
          v-model="email"
          :readonly="fieldsLocked"
          label="Email"
          type="email"
          outlined
          class="q-mb-md"
          :class="{ 'readonly-field': fieldsLocked }"
          :rules="[val => !!val || 'Email je obavezan', val => /.+@.+\..+/.test(val) || 'Neispravan format emaila']"
        />
        <q-input
          v-model="telefon"
          :readonly="fieldsLocked"
          label="Telefon"
          outlined
          class="q-mb-md"
          :class="{ 'readonly-field': fieldsLocked }"
          :rules="phoneRules"
        />
        <q-input v-model="adresa" :readonly="fieldsLocked" label="Adresa" outlined class="q-mb-md" :class="{ 'readonly-field': fieldsLocked }" />

        <q-btn
          v-if="fieldsLocked"
          label="Promijeni podatke"
          color="primary"
          class="full-width q-mb-md"
          @click="unlockFields"
          :loading="loading"
          :disable="loading"
        />
        <div v-else>
          <q-btn
            label="Spremi promjene"
            color="primary"
            class="full-width q-mb-sm"
            @click="updateUser"
            :loading="loading"
            :disable="loading"
          />
          <q-btn
            label="Odustani"
            color="negative"
            class="full-width"
            @click="cancelUserChanges"
            :disable="loading"
          />
        </div>

        <q-btn
          v-if="!showChangePassword"
          label="Promijeni lozinku"
          color="secondary"
          class="full-width q-mb-md"
          style="margin-top: 16px;"
          @click="toggleChangePasswordFields"
        />
        <div v-if="showChangePassword" class="q-mt-md">
          <q-input v-model="oldPassword" label="Trenutna lozinka" type="password" outlined dense class="q-mb-md" />
          <q-input v-model="newPassword" label="Nova lozinka" type="password" outlined dense class="q-mb-md" />
          <q-input v-model="repeatNewPassword" label="Ponovi novu lozinku" type="password" outlined dense class="q-mb-md" />

          <div class="text-caption q-mb-md" style="padding-left: 10px;">
            <ul style="list-style: none; padding-left: 0; margin: 0;">
              <li :class="{ 'text-positive': passwordRules.minLength, 'text-negative': !passwordRules.minLength }">✔️ Minimum 8 znakova</li>
              <li :class="{ 'text-positive': passwordRules.uppercase, 'text-negative': !passwordRules.uppercase }">✔️ Barem jedno veliko slovo</li>
              <li :class="{ 'text-positive': passwordRules.lowercase, 'text-negative': !passwordRules.lowercase }">✔️ Barem jedno malo slovo</li>
              <li :class="{ 'text-positive': passwordRules.number, 'text-negative': !passwordRules.number }">✔️ Barem jedan broj</li>
              <li :class="{ 'text-positive': passwordRules.specialChar, 'text-negative': !passwordRules.specialChar }">✔️ Barem jedan specijalni znak (!@#$%^&*,.-_)</li>
            </ul>
          </div>

          <div class="row q-gutter-sm">
            <q-btn
              label="Spremi novu lozinku"
              color="secondary"
              :loading="loadingChangePassword"
              :disable="loadingChangePassword"
              @click="changePassword"
              class="full-width"
              style="flex: 1"
            />
            <q-btn
              label="Odustani"
              color="negative"
              class="full-width"
              :disable="loadingChangePassword"
              @click="cancelChangePassword"
              style="flex: 1"
            />
          </div>
        </div>
      </div>

      <div style="width: 600px; display: flex; flex-direction: column;">
        <h2 class="text-h5 text-primary q-mb-md">Moje bilješke</h2>

        <q-input
          dense
          debounce="300"
          outlined
          v-model="searchQuery"
          label="Pretraži bilješke (po naslovu ili sadržaju)"
          bottom-slots
          class="q-mb-md"
          clearable
          style="width: 100%;"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="row q-gutter-sm q-mb-md" style="width: 100%;">
          <q-input
            v-model="newNoteContent"
            label="Nova bilješka"
            maxlength="500"
            outlined
            dense
            style="flex: 1;"
            :disable="notes.length >= maxNotes"
            counter
            @keyup.enter="addNote"
          />
          <q-btn label="Dodaj" icon="add" color="primary" dense :disable="!canAddNote" @click="addNote" />
        </div>

        <q-list bordered style="max-height: 700px; overflow-y: auto;">
          <q-item v-for="(note, index) in filteredNotes" :key="note.ID_Biljeska" dense>
            <q-item-section style="min-width: 150px; max-width: 180px;">
              <q-input
                v-model="note.naziv_biljeske"
                dense
                outlined
                :readonly="!note.editableName"
                :rules="titleRules"
                debounce="300"
                @blur="note.editableName ? saveNote(note) : null"
                @keydown.enter.prevent="note.editableName && saveNote(note)"
              />
            </q-item-section>
            <q-item-section>
              <q-input
                v-model="note.sadrzaj_biljeske"
                dense
                outlined
                type="textarea"
                style="min-height: 60px; width: 100%;"
                :readonly="!note.editableContent"
                :rules="contentRules"
                @blur="note.editableContent ? saveNote(note) : null"
                @keydown.enter.prevent="note.editableContent && saveNote(note)"
              />
            </q-item-section>
            <q-item-section side top>
              <q-btn
                dense
                flat
                round
                icon="edit"
                :color="note.editableName || note.editableContent ? 'primary' : 'grey'"
                @click="toggleEdit(note)"
                :title="note.editableName || note.editableContent ? 'Spremi promjene (Enter)' : 'Uredi bilješku'"
              />
              <q-btn
                dense
                flat
                round
                icon="delete"
                color="negative"
                @click="deleteNote(note.ID_Biljeska, index)"
                aria-label="Obriši bilješku"
                :title="'Obriši bilješku ' + note.naziv_biljeske"
              />
            </q-item-section>
          </q-item>
          <q-item v-if="filteredNotes.length === 0" class="text-center q-pa-md">
            <q-item-section>Nema bilješki za prikaz.</q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useQuasar } from 'quasar'
import { useUser } from 'src/composables/useUser'

const router = useRouter()
const $q = useQuasar()
const { user, isAuthenticated } = useUser()

const ime = ref('')
const prezime = ref('')
const korisnicko_ime = ref('')
const jmbag = ref('')
const email = ref('')
const telefon = ref('')
const adresa = ref('')

const profilePhotoUrl = ref('')
const placeholderUrl = '/uploads/png-transparent-default-avatar.png'
const hasProfilePhoto = computed(() => profilePhotoUrl.value && profilePhotoUrl.value !== placeholderUrl)

const fileInput = ref(null)
const selectedFile = ref(null)
const isUploading = ref(false)

const loading = ref(false)
const fieldsLocked = ref(true)
const isDeleteConfirm = ref(false)

const showChangePassword = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const repeatNewPassword = ref('')
const loadingChangePassword = ref(false)

const passwordRules = ref({
  minLength: false,
  uppercase: false,
  lowercase: false,
  number: false,
  specialChar: false,
})

const jmbagRules = [
  val => /^\d{10}$/.test(val) || 'JMBAG mora imati točno 10 znamenki'
]

const phoneRules = [
  val => !!val || 'Telefon je obavezan',
  val => /^\+385\d{8,9}$/.test(val) || 'Telefon mora početi s +385 i imati 8 ili 9 znamenki nakon'
]

watch(newPassword, (val) => {
  passwordRules.value.minLength = val.length >= 8
  passwordRules.value.uppercase = /[A-Z]/.test(val)
  passwordRules.value.lowercase = /[a-z]/.test(val)
  passwordRules.value.number = /[0-9]/.test(val)
  passwordRules.value.specialChar = /[!@#$%^&*,.\-_]/.test(val)
})

const maxNotes = 100
const notes = ref([])
const newNoteContent = ref('')
const searchQuery = ref('')

const canAddNote = computed(() => newNoteContent.value.trim().length > 0 && notes.value.length < maxNotes)
const filteredNotes = computed(() => {
  if (!searchQuery.value) return notes.value
  const q = searchQuery.value.toLowerCase()
  return notes.value.filter(note =>
    (note.naziv_biljeske?.toLowerCase().includes(q) || note.sadrzaj_biljeske?.toLowerCase().includes(q))
  )
})

const titleRules = [
  val => !!val || 'Naslov je obavezan',
  val => (val && val.length <= 100) || 'Naslov može imati do 100 znakova',
]
const contentRules = [
  val => !!val || 'Sadržaj je obavezan',
  val => (val && val.length <= 500) || 'Sadržaj može imati do 500 znakova',
]

function toggleEdit(note) {
  if (note.editableName || note.editableContent) {
    saveNote(note)
  } else {
    note.editableName = true
    note.editableContent = true
  }
}

async function fetchUserData() {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }
  try {
    const userId = user.value?.id
    if (!userId) return
    const resp = await axios.get(`http://localhost:3000/accountUpdate/${userId}`)
    if (!resp.data.error && resp.data.user) {
      const u = resp.data.user
      ime.value = u.ime_korisnika || ''
      prezime.value = u.prezime_korisnika || ''
      korisnicko_ime.value = u.korisnicko_ime || ''
      jmbag.value = u.jmbag_korisnika || ''
      email.value = u.email || ''
      telefon.value = u.telefon || ''
      adresa.value = u.adresa || ''
      profilePhotoUrl.value = u.slika_url ? `http://localhost:3000${u.slika_url}?t=${Date.now()}` : placeholderUrl
      lockFields()
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška pri dohvaćanju podataka korisnika.' })
    }
  } catch (err) {
    console.error('Error fetching user data:', err)
    $q.notify({ type: 'negative', message: 'Greška pri dohvaćanju podataka korisnika.' })
  }
}

async function fetchNotes() {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }
  try {
    const userId = user.value?.id
    if (!userId) return

    const resp = await axios.get(`http://localhost:3000/notes/${userId}`)
    if (!resp.data.error && Array.isArray(resp.data.notes)) {
      notes.value = resp.data.notes.map(note => ({ ...note, editableName: false, editableContent: false }))
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška pri dohvaćanju bilješki.' })
    }
  } catch (err) {
    console.error('Error fetching notes:', err)
    $q.notify({ type: 'negative', message: 'Greška pri dohvaćanju bilješki s poslužitelja.' })
  }
}

function unlockFields() {
  fieldsLocked.value = false
}

function lockFields() {
  fieldsLocked.value = true
}

function cancelUserChanges() {
  fetchUserData()
  lockFields()
}

async function cancelChangePassword() {
  oldPassword.value = ''
  newPassword.value = ''
  repeatNewPassword.value = ''
  showChangePassword.value = false
  passwordRules.value = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  }
}

function toggleChangePasswordFields() {
  showChangePassword.value = !showChangePassword.value
  oldPassword.value = ''
  newPassword.value = ''
  repeatNewPassword.value = ''
  passwordRules.value = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  }
}

async function updateUser() {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }

  if (!phoneRules.every(fn => fn(telefon.value) === true) || !jmbagRules.every(fn => fn(jmbag.value) === true)) {
    $q.notify({ type: 'negative', message: 'Molimo ispravite JMBAG i/ili telefon prema pravilima.' })
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
    const resp = await axios.put(`http://localhost:3000/accountUpdate/${userId}`, payload)

    if (resp.data && resp.data.error === false) {
      $q.notify({ type: 'positive', message: 'Podaci uspješno ažurirani.' })
      lockFields()
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Nepoznata greška prilikom ažuriranja podataka.' })
    }
  } catch (err) {
    console.error('Update error:', err)
    $q.notify({ type: 'negative', message: 'Greška pri ažuriranju podataka: ' + (err.response?.data?.message || err.message) })
  } finally {
    loading.value = false
  }
}

async function changePassword() {
  if (!oldPassword.value || !newPassword.value || !repeatNewPassword.value) {
    $q.notify({ type: 'negative', message: 'Molimo unesite trenutnu lozinku, novu lozinku i potvrdu nove lozinke.' })
    return
  }
  if (newPassword.value === oldPassword.value) {
    $q.notify({ type: 'negative', message: 'Nova lozinka ne smije biti ista kao trenutna lozinka.' })
    return
  }
  if (newPassword.value !== repeatNewPassword.value) {
    $q.notify({ type: 'negative', message: 'Nova lozinka i potvrda nove lozinke se ne podudaraju.' })
    return
  }
  if (
    !passwordRules.value.minLength ||
    !passwordRules.value.uppercase ||
    !passwordRules.value.lowercase ||
    !passwordRules.value.number ||
    !passwordRules.value.specialChar
  ) {
    $q.notify({ type: 'negative', message: 'Nova lozinka ne zadovoljava kriterije sigurnosti.' })
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
    const resp = await axios.put(`http://localhost:3000/accountUpdate/${userId}/changePassword`, {
      oldPassword: oldPassword.value,
      newPassword: newPassword.value
    })
    if (resp.data && resp.data.error === false) {
      $q.notify({ type: 'positive', message: 'Lozinka je uspješno promijenjena.' })
      toggleChangePasswordFields()
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška pri promjeni lozinke.' })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: err.response?.data?.message || 'Greška pri promjeni lozinke.' })
  } finally {
    loadingChangePassword.value = false
  }
}

function onChangeProfilePhoto() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function onImgError(event) {
  event.target.src = placeholderUrl
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

    const resp = await axios.put(`http://localhost:3000/accountUpdate/${userId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (resp.data && resp.data.error === false) {
      $q.notify({ type: 'positive', message: 'Slika profila uspješno promijenjena' })
      selectedFile.value = null
      isUploading.value = false
      if (fileInput.value) fileInput.value.value = null

      if (resp.data.profile_photo_url) {
        profilePhotoUrl.value = `http://localhost:3000${resp.data.profile_photo_url}?t=${Date.now()}`
      }
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Nepoznata greška prilikom ažuriranja slike profila.' })
      discardProfilePicture()
    }
  } catch (err) {
    console.error('Image upload error:', err)
    $q.notify({ type: 'negative', message: 'Greška prilikom ažuriranja slike profila.' })
    discardProfilePicture()
  } finally {
    loading.value = false
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

function startDeleteConfirmation() {
  isDeleteConfirm.value = true
  isUploading.value = false
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = null
}

function cancelDeleteProfilePicture() {
  isDeleteConfirm.value = false
}

async function confirmDeleteProfilePicture() {
  loading.value = true
  try {
    const userId = user.value?.id
    if (!userId) {
      $q.notify({ type: 'negative', message: 'Korisnik nije prijavljen.' })
      router.push('/login')
      return
    }
    const resp = await axios.delete(`http://localhost:3000/accountUpdate/${userId}/photo`)
    if (resp.data && resp.data.error === false) {
      $q.notify({ type: 'positive', message: 'Profilna slika uspješno obrisana.' })
      isDeleteConfirm.value = false
      await fetchUserData()
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška prilikom brisanja profilne slike.' })
    }
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Greška prilikom brisanja profilne slike.' })
  } finally {
    loading.value = false
  }
}

async function addNote() {
  if (!canAddNote.value) return
  const content = newNoteContent.value.trim()
  const userId = user.value?.id
  if (!userId) return

  try {
    const newNaziv = `Bilješka ${notes.value.length + 1}`
    const payload = {
      naziv_biljeske: newNaziv,
      sadrzaj_biljeske: content,
      ID_korisnika: userId
    }
    const resp = await axios.post('http://localhost:3000/notes', payload)
    if (!resp.data.error) {
      const added = resp.data.note
      added.editableName = false
      added.editableContent = false
      notes.value.push(added)
      newNoteContent.value = ''
      $q.notify({ type: 'positive', message: 'Bilješka je dodana.' })
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška pri dodavanju bilješke.' })
    }
  } catch (err) {
    console.error('Error adding note:', err)
    $q.notify({ type: 'negative', message: 'Greška pri dodavanju bilješke.' })
  }
}

function toggleEditName(note) {
  note.editableName = !note.editableName
}

async function saveNoteName(note) {
  if (!note.editableName) return
  if (!note.ID_Biljeska) return

  const trimmedName = note.naziv_biljeske.trim()
  if (trimmedName.length === 0 || trimmedName.length > 100) {
    $q.notify({ type: 'negative', message: 'Naziv bilješke mora biti između 1 i 100 znakova.' })
    return
  }

  try {
    const payload = {
      naziv_biljeske: trimmedName,
      sadrzaj_biljeske: note.sadrzaj_biljeske?.trim() || ''
    }
    const resp = await axios.put(`http://localhost:3000/notes/${note.ID_Biljeska}`, payload)
    if (!resp.data.error) {
      note.naziv_biljeske = trimmedName
      note.datum_biljeske = resp.data.datum_biljeske || note.datum_biljeske
      note.editableName = false
      $q.notify({ type: 'positive', message: 'Naziv bilješke je ažuriran.' })
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška pri ažuriranju naziva bilješke.' })
    }
  } catch (err) {
    console.error('Error updating note name:', err)
    $q.notify({ type: 'negative', message: 'Greška pri ažuriranju naziva bilješke.' })
  }
}

function toggleEditNote(note) {
  note.editableContent = !note.editableContent
}

async function saveNoteContent(note) {
  if (!note.editableContent) return
  if (!note.ID_Biljeska) return

  const trimmed = note.sadrzaj_biljeske.trim()
  if (trimmed.length === 0) {
    $q.notify({ type: 'negative', message: 'Bilješka ne može biti prazna.' })
    return
  }
  if (trimmed.length > 500) {
    $q.notify({ type: 'negative', message: 'Bilješka ne može biti duža od 500 znakova.' })
    return
  }

  try {
    const payload = {
      naziv_biljeske: note.naziv_biljeske.trim(),
      sadrzaj_biljeske: trimmed
    }
    const resp = await axios.put(`http://localhost:3000/notes/${note.ID_Biljeska}`, payload)
    if (!resp.data.error) {
      note.sadrzaj_biljeske = trimmed
      note.datum_biljeske = resp.data.datum_biljeske || note.datum_biljeske
      note.editableContent = false
      $q.notify({ type: 'positive', message: 'Bilješka je ažurirana.' })
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška pri ažuriranju bilješke.' })
    }
  } catch (err) {
    console.error('Error updating note:', err)
    $q.notify({ type: 'negative', message: 'Greška pri ažuriranju bilješke.' })
  }
}

async function deleteNote(noteId, index) {
  if (!noteId) return
  try {
    const resp = await axios.delete(`http://localhost:3000/notes/${noteId}`)
    if (!resp.data.error) {
      notes.value.splice(index, 1)
      $q.notify({ type: 'positive', message: 'Bilješka je obrisana.' })
    } else {
      $q.notify({ type: 'negative', message: resp.data.message || 'Greška pri brisanju bilješke.' })
    }
  } catch (err) {
    console.error('Error deleting note:', err)
    $q.notify({ type: 'negative', message: 'Greška pri brisanju bilješke.' })
  }
}

onMounted(async () => {
  if (!isAuthenticated()) {
    router.push('/login')
    return
  }
  await fetchUserData()
  await fetchNotes()
})
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

.text-positive {
  color: #21ba45; 
}

.text-negative {
  color: #db2828;
}
</style>

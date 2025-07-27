<template>
  <q-page class="q-pa-md" style="position: relative; overflow: hidden">
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
        <div class="column justify-center" style="max-width: 500px">
          <div class="text-h2 text-primary text-bold">VeleriSpace</div>
          <div class="text-h5 text-black q-mt-md">
            VeleriSpace tvoja studentska mreža za povezivanje i dijeljenje informacija.
          </div>
        </div>
        <div class="row full-height justify-center q-px-xl" style="width: 55%">
          <q-card class="q-pa-lg" style="width: 100%; max-width: 400px; border-radius: 20px">
            <div class="text-h5 text-center text-primary text-bold q-mb-md">Registracija</div>

            <q-input v-model="ime" label="Ime" outlined class="q-mb-md" />
            <q-input v-model="prezime" label="Prezime" outlined class="q-mb-md" />
            <q-input v-model="korisnicko_ime" label="Korisničko ime" outlined class="q-mb-md" />
            <q-input v-model="lozinka" label="Lozinka" type="password" outlined class="q-mb-md" />
            <q-input v-model="jmbag" label="JMBAG" outlined class="q-mb-md" />

            <q-input
              v-model="email"
              label="Email"
              type="email"
              outlined
              class="q-mb-md"
              :rules="[val => !!val || 'Email je obavezan', val => /.+@.+\..+/.test(val) || 'Neispravan format emaila']"
            />
            <q-input v-model="telefon" label="Telefon" outlined class="q-mb-md" />
            <q-input v-model="adresa" label="Adresa" outlined class="q-mb-md" />

            <q-btn
              label="Registriraj se"
              color="primary"
              @click="register"
              class="q-mt-md full-width"
              :loading="loading"
              :disable="loading"
            />
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const ime = ref('')
const prezime = ref('')
const korisnicko_ime = ref('')
const lozinka = ref('')
const jmbag = ref('')
const email = ref('')
const telefon = ref('')
const adresa = ref('')

const router = useRouter()
const loading = ref(false)

async function register() {
  if (
    !ime.value.trim() ||
    !prezime.value.trim() ||
    !korisnicko_ime.value.trim() ||
    !lozinka.value.trim() ||
    !jmbag.value.trim() ||
    !email.value.trim() ||
    !telefon.value.trim() ||
    !adresa.value.trim()
  ) {
    alert('Molimo popunite sva obavezna polja.')
    return
  }

  // Optionally add more client-side validation here (email format, phone format, etc.)

  loading.value = true
  try {
    const response = await axios.post('http://localhost:3000/regaKorisnika', {
      ime: ime.value.trim(),
      prezime: prezime.value.trim(),
      korisnicko_ime: korisnicko_ime.value.trim(),
      lozinka: lozinka.value,
      jmbag: jmbag.value.trim(),
      email: email.value.trim(),
      telefon: telefon.value.trim(),
      adresa: adresa.value.trim(),
    })

    if (response.data?.error === false) {
      alert('Registracija uspješna!')
      router.push('/')
    } else {
      alert('Poruka sustava: ' + (response.data?.message || 'Nepoznata greška.'))
    }
  } catch (err) {
    console.error('Registration error:', err)

    if (err.response) {
      alert('Greška s poslužiteljem: ' + (err.response.data?.message || 'Nepoznata greška na poslužitelju.'))
    } else if (err.request) {
      alert('Nema odgovora s poslužitelja. Provjerite da li je server pokrenut i dostupna mreža.')
    } else {
      alert('Greška u slanju zahtjeva: ' + err.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
.background-image {
  background-image: url('/velerilogo.png');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  opacity: 0.25;
  z-index: -1;
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>

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

            <q-btn
              label="Registriraj se"
              color="primary"
              @click="register"
              class="q-mt-md full-width"
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

const router = useRouter()

async function register() {
  try {
    const response = await axios.post('http://localhost:3000/regaKorisnika', {
      ime: ime.value,
      prezime: prezime.value,
      korisnicko_ime: korisnicko_ime.value,
      lozinka: lozinka.value,
      jmbag: jmbag.value
    })

    if (response.data?.error === false) {
      alert('Registracija uspješna!')
      router.push('/')
    } else {
      alert('Poruka sustava: ' + (response.data?.message || 'Nepoznata greška.'))
    }
  } catch (err) {
    alert('Greška pri registraciji: ' + (err.response?.data?.message || err.message))
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

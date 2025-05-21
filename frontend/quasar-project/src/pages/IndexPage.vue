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
            <div class="text-h5 text-center text-primary text-bold q-mb-md">VeleriSpace</div>

            <q-input
              v-model="korisnickoime"
              type="email"
              label="Korisničko ime"
              placeholder="npr. kolega123"
              class="q-mb-md"
              outlined
            />

            <q-input
              v-model="lozinka"
              type="password"
              label="Lozinka"
              placeholder="Lozinka"
              class="q-mb-lg"
              outlined
            />

            <q-btn
              label="Prijavi se"
              color="primary"
              class="full-width"
              @click="login"
              style="border-radius: 20px"
            />
            <div class="text-center q-mt-md">
              Zaboravili ste
              <router-link to="/Register" class="text-primary">lozinku</router-link>
              ?
            </div>
            <q-separator spaced />
            <q-btn
              label="Kreiraj novi korisnički račun"
              color="primary"
              class="full-width q-mt-md"
              @click="register"
              style="border-radius: 20px"
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

const korisnickoime = ref('')
const lozinka = ref('')
const router = useRouter()

function login() {
  const korisnik = {
    email: korisnickoime.value,
  }
  localStorage.setItem('korisnik', JSON.stringify(korisnik))
  korisnickoime.value = ''
  lozinka.value = ''
  console.log('Korisnik prijavljen i spremljen u localStorage:', korisnik)
  router.push('/forum')
}

function register() {}
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

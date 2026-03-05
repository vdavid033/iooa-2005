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
          <q-card class="q-pa-lg" style="width: 100%; max-width: 800px; border-radius: 20px">
            <div class="text-h5 text-center text-primary text-bold q-mb-md">Registracija</div>

            <div
              class="q-gutter-md"
              style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;"
            >
              <q-input v-model="ime" label="Ime" outlined :rules="[v => !!v || 'Ime je obavezno']" />
              <q-input v-model="prezime" label="Prezime" outlined :rules="[v => !!v || 'Prezime je obavezno']" />

              <q-input
                v-model="jmbag"
                label="JMBAG"
                outlined
                :rules="[
                  v => !!v || 'JMBAG je obavezan',
                  v => /^\d{10}$/.test(v) || 'JMBAG mora sadržavati točno 10 znamenki'
                ]"
              />

              <q-input
                v-model="korisnicko_ime"
                label="Korisničko ime"
                outlined
                :rules="[v => !!v || 'Korisničko ime je obavezno']"
              />

              <div style="display: flex; flex-direction: column;">
                <q-input
                  v-model="lozinka"
                  label="Lozinka"
                  type="password"
                  outlined
                  :rules="[v => !!v || 'Lozinka je obavezna']"
                  @input="validatePassword"
                />

                <div class="text-caption q-mt-xs" style="padding-left: 10px;">
                  <ul style="list-style: none; padding-left: 0; margin: 0;">
                    <li
                      :class="{ 'text-positive': passwordRules.minLength, 'text-negative': !passwordRules.minLength }"
                    >
                      ✔️ Minimum 8 znakova
                    </li>
                    <li
                      :class="{ 'text-positive': passwordRules.uppercase, 'text-negative': !passwordRules.uppercase }"
                    >
                      ✔️ Barem jedno veliko slovo
                    </li>
                    <li
                      :class="{ 'text-positive': passwordRules.lowercase, 'text-negative': !passwordRules.lowercase }"
                    >
                      ✔️ Barem jedno malo slovo
                    </li>
                    <li
                      :class="{ 'text-positive': passwordRules.number, 'text-negative': !passwordRules.number }"
                    >
                      ✔️ Barem jedan broj
                    </li>
                    <li
                      :class="{ 'text-positive': passwordRules.specialChar, 'text-negative': !passwordRules.specialChar }"
                    >
                      ✔️ Barem jedan specijalni znak (!@#$%^&*,.-_)
                    </li>
                  </ul>
                </div>
              </div>

              <q-input
                v-model="lozinkaRepeated"
                label="Ponovi lozinku"
                type="password"
                outlined
                :rules="[
                  v => !!v || 'Potvrda lozinke je obavezna',
                  v => v === lozinka || 'Lozinke se ne podudaraju'
                ]"
              />

              <q-input
                v-model="email"
                label="Email"
                type="email"
                outlined
                :rules="[
                  v => !!v || 'Email je obavezan',
                  v => /.+@.+\..+/.test(v) || 'Neispravan format emaila'
                ]"
              />
              <q-input
                v-model="telefon"
                label="Telefon"
                outlined
                lazy-rules
                @blur="onTelefonBlur"
                :rules="[
                  v => !!v || 'Telefon je obavezan',
                  v => /^\+385\d{8,9}$/.test(v) || 'Telefon mora početi s +385 i imati 8 ili 9 znamenki nakon'
                ]"
              />
              <q-input v-model="adresa" label="Adresa" outlined :rules="[v => !!v || 'Adresa je obavezna']" />
            </div>

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
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import axios from "axios";

const $q = useQuasar();
const router = useRouter();

const ime = ref("");
const prezime = ref("");
const korisnicko_ime = ref("");
const lozinka = ref("");
const lozinkaRepeated = ref("");
const jmbag = ref("");
const email = ref("");
const telefon = ref("");
const adresa = ref("");

const loading = ref(false);

const passwordRules = reactive({
  minLength: false,
  uppercase: false,
  lowercase: false,
  number: false,
  specialChar: false,
});

watch(lozinka, (newVal) => {
  passwordRules.minLength = newVal.length >= 8;
  passwordRules.uppercase = /[A-Z]/.test(newVal);
  passwordRules.lowercase = /[a-z]/.test(newVal);
  passwordRules.number = /[0-9]/.test(newVal);
  passwordRules.specialChar = /[!@#$%^&*,.\-_]/.test(newVal);
});

function onTelefonBlur() {
  if (telefon.value && !telefon.value.startsWith("+385")) {
    telefon.value = "+385" + telefon.value.replace(/^0+/, ""); 
  }
}

function validateFields() {
  if (!ime.value.trim()) {
    $q.notify({ color: "negative", message: "Ime je obavezno.", position: "top" });
    return false;
  }
  if (!prezime.value.trim()) {
    $q.notify({ color: "negative", message: "Prezime je obavezno.", position: "top" });
    return false;
  }
  if (!korisnicko_ime.value.trim()) {
    $q.notify({ color: "negative", message: "Korisničko ime je obavezno.", position: "top" });
    return false;
  }
  if (!lozinka.value) {
    $q.notify({ color: "negative", message: "Lozinka je obavezna.", position: "top" });
    return false;
  }
  if (
    !passwordRules.minLength ||
    !passwordRules.uppercase ||
    !passwordRules.lowercase ||
    !passwordRules.number ||
    !passwordRules.specialChar
  ) {
    $q.notify({ color: "negative", message: "Lozinka ne zadovoljava kriterije sigurnosti.", position: "top" });
    return false;
  }
  if (!lozinkaRepeated.value) {
    $q.notify({ color: "negative", message: "Potvrda lozinke je obavezna.", position: "top" });
    return false;
  }
  if (lozinkaRepeated.value !== lozinka.value) {
    $q.notify({ color: "negative", message: "Lozinke se ne podudaraju.", position: "top" });
    return false;
  }
  if (!jmbag.value) {
    $q.notify({ color: "negative", message: "JMBAG je obavezan.", position: "top" });
    return false;
  }
  if (!/^\d{10}$/.test(jmbag.value)) {
    $q.notify({ color: "negative", message: "JMBAG mora sadržavati točno 10 znamenki.", position: "top" });
    return false;
  }
  if (!email.value.trim()) {
    $q.notify({ color: "negative", message: "Email je obavezan.", position: "top" });
    return false;
  }
  if (!/.+@.+\..+/.test(email.value)) {
    $q.notify({ color: "negative", message: "Neispravan format emaila.", position: "top" });
    return false;
  }
  if (!telefon.value) {
    $q.notify({ color: "negative", message: "Telefon je obavezan.", position: "top" });
    return false;
  }
  if (!/^\+385\d{8,9}$/.test(telefon.value)) {
    $q.notify({ color: "negative", message: "Telefon mora početi s +385 i imati 8 ili 9 znamenki nakon.", position: "top" });
    return false;
  }
  if (!adresa.value.trim()) {
    $q.notify({ color: "negative", message: "Adresa je obavezna.", position: "top" });
    return false;
  }
  return true;
}

async function register() {
  if (!validateFields()) {
    return;
  }

  loading.value = true;
  try {
    const response = await axios.post("http://localhost:3000/regaKorisnika", {
      ime: ime.value.trim(),
      prezime: prezime.value.trim(),
      korisnicko_ime: korisnicko_ime.value.trim(),
      lozinka: lozinka.value,
      jmbag: jmbag.value.trim(),
      email: email.value.trim(),
      telefon: telefon.value.trim(),
      adresa: adresa.value.trim(),
    });

    if (response.data?.error === false) {
      $q.notify({ color: "positive", message: "Registracija uspješna!", position: "top" });
      router.push("/");
    } else {
      $q.notify({
        color: "negative",
        message: `Poruka sustava: ${response.data?.message || "Nepoznata greška."}`,
        position: "top",
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    if (err.response) {
      $q.notify({
        color: "negative",
        message: `Greška s poslužiteljem: ${err.response.data?.message || "Nepoznata greška na poslužitelju."}`,
        position: "top",
      });
    } else if (err.request) {
      $q.notify({
        color: "negative",
        message: "Nema odgovora s poslužitelja. Provjerite da li je server pokrenut i dostupna mreža.",
        position: "top",
      });
    } else {
      $q.notify({ color: "negative", message: `Greška u slanju zahtjeva: ${err.message}`, position: "top" });
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style>
.background-image {
  background-image: url("/velerilogo.png");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  opacity: 0.25;
  z-index: -1;
  position: absolute;
  width: 100%;
  height: 100%;
}

.text-positive {
  color: #21ba45; 
}

.text-negative {
  color: #db2828;
}
</style>

<template>
  <q-page padding>
    <q-card v-if="isAuthenticated()">
      <q-card-section horizontal class="text-bold">
        <q-card-section class="col-3"> User ID: {{ user?.id }}</q-card-section>
        <q-card-section class="col-3"> Name: {{ user?.ime }}</q-card-section>
        <q-card-section class="col-3"> Role: {{ user?.uloga }}</q-card-section>
        <q-card-section class="col-3">
          <q-btn @click="logout()">Logout</q-btn>
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-card v-else>
      <q-form @submit.prevent="login" class="q-gutter-md">
        <q-input
          filled
          v-model="name"
          label="Korisničko ime *"
          hint="Korisničko ime"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />
        <q-input
          filled
          v-model="passwd"
          type="password"
          label="Lozinka *"
          hint="Lozinka"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />
        <div>
          <q-btn label="Submit" type="submit" color="primary" />
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" @click="resetForm" />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUser } from 'src/composables/useUser'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const name = ref(null)
const passwd = ref(null)
const { user, isAuthenticated, loadUserFromToken, logout } = useUser()

function resetForm() {
  name.value = null
  passwd.value = null
}

async function login() {
  try {
    const { data } = await axios.post("http://localhost:3000/api/login", {
      username: name.value,
      password: passwd.value,
    });

    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
      await loadUserFromToken();
      $q.notify({
        color: "green-6",
        icon: "check_circle",
        message: "Prijava uspješna",
        position: "bottom",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else if (data.message) {
      $q.notify({
        color: "red-6",
        icon: "warning",
        message: data.message,
        position: "bottom",
      });
    }
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    $q.notify({
      color: "red-6",
      icon: "error",
      message: msg,
      position: "bottom",
    });
    console.error("Login failed:", msg);
  }
}

onMounted(() => {
  loadUserFromToken()
})
</script>

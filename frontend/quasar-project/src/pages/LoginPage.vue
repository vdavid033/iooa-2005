<template>
  <q-page padding>
    <q-card v-if="isAuthenticated()">
      <q-card-section horizontal class="text-bold">
        <q-card-section class="col-3">User ID: {{ user?.id }}</q-card-section>
        <q-card-section class="col-3">Name: {{ user?.ime }}</q-card-section>
        <q-card-section class="col-3">Role: {{ user?.uloga }}</q-card-section>
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
          :rules="[(val) => !!val || 'Unesite korisničko ime']"
        />
        <q-input
          filled
          v-model="passwd"
          type="password"
          label="Lozinka *"
          hint="Lozinka"
          lazy-rules
          :rules="[(val) => !!val || 'Unesite lozinku']"
        />
        <div>
          <q-btn label="Prijavi se" type="submit" color="primary" />
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useUser } from 'src/composables/useUser'

const name = ref('')
const passwd = ref('')
const { user, isAuthenticated, loadUserFromToken, logout } = useUser()

async function login() {
  try {
    const { data } = await axios.post('http://localhost:3000/api/login', {
      username: name.value,
      password: passwd.value,
    })

    if (data.token) {
      localStorage.setItem('token', data.token)
      loadUserFromToken()
      window.location.href = '/'
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data?.message || error.message)
    alert('Neuspješna prijava. Provjerite korisničko ime i lozinku.')
  }
}

onMounted(() => {
  loadUserFromToken()
})
</script>

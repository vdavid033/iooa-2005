<template>
<<<<<<< HEAD
  <q-page>
    <q-card v-if="isAuth()">
      <q-card-section horizontal class="text-bold">
        <q-card-section class="col-3">
         User ID: {{ fullUser.id }} 
        </q-card-section>
        <q-card-section class="col-3">
          Name:{{ fullUser.ime }}
        </q-card-section>
        <q-card-section class="col-3">
          Role: {{ fullUser.uloga }}
        </q-card-section>
=======
  <q-page padding>
    <q-card v-if="isAuthenticated()">
      <q-card-section horizontal class="text-bold">
        <q-card-section class="col-3"> User ID: {{ user?.id }}</q-card-section>
        <q-card-section class="col-3"> Name:{{ user?.ime }}</q-card-section>
        <q-card-section class="col-3"> Role: {{ user?.uloga }}</q-card-section>
>>>>>>> development
        <q-card-section class="col-3">
          <q-btn v-on:click="logout()">Logout</q-btn>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-card v-else>
<<<<<<< HEAD
      <q-form
        @submit="login"
        class="q-gutter-md"
      >
=======
      <q-form @submit="login" class="q-gutter-md">
>>>>>>> development
        <q-input
          filled
          v-model="name"
          label="Korisničko ime *"
          hint="Korisničko ime "
          lazy-rules
<<<<<<< HEAD
          :rules="[ val => val && val.length > 0 || 'Please type something']"
=======
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
>>>>>>> development
        />
        <q-input
          filled
          v-model="passwd"
<<<<<<< HEAD
          label="Lozinka *"
          hint="Lozinka"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please type something']"
        />
        <div>
          <q-btn label="Submit" type="submit" color="primary" @click="login()"/>
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card>  
=======
          type="password"
          label="Lozinka *"
          hint="Lozinka"
          lazy-rules
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />
        <div>
          <q-btn label="Submit" type="submit" color="primary" @click="login()" />
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
    </q-card>
>>>>>>> development
  </q-page>
</template>

<script setup>
<<<<<<< HEAD
import { ref } from 'vue'
import axios from 'axios';
import { jwtDecode } from "jwt-decode";

const name = ref(null);
const passwd = ref(null);
const fullUser = ref({});

async function login() {
  const formData = {
    "username": name.value,
    "password": passwd.value
  }

  await axios.post('http://localhost:3000/api/login/', formData)
    .then((result) => {
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
        setTimeout(() => { 
            window.location.reload();
        },20);
      } else {
        //notification
      }
    })
    .catch(error => {
      console.error(error)
    })
  }
  const isAuth = () => {
    if (localStorage !== "") {
      const token = localStorage.getItem("token");
      if (token) {
        fullUser.value = decodeToken(token);
        console.log("auth",decodeToken(token));
        return token;
      }
    }
  }

  const decodeToken = (token) => { 
    try { 
      const decoded = jwtDecode(token); 
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error); 
      return null; 
    } 
  };
  const logout = ()=> {
    localStorage.removeItem("token");
    window.location.reload();
  }
=======
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useUser } from 'src/composables/useUser'

const name = ref(null)
const passwd = ref(null)
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
  }
}

onMounted(() => {
  loadUserFromToken()
})
>>>>>>> development
</script>

<template>
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
        <q-card-section class="col-3">
          <q-btn v-on:click="logout()">Logout</q-btn>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-card v-else>
      <q-form
        @submit="login"
        class="q-gutter-md"
      >
        <q-input
          filled
          v-model="name"
          label="Korisničko ime *"
          hint="Korisničko ime "
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please type something']"
        />
        <q-input
          filled
          v-model="passwd"
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
  </q-page>
</template>

<script setup>
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

  await axios.post('http://localhost:3001/api/login/', formData)
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
</script>

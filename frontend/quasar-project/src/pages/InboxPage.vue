<template>
    <q-page class="q-pa-md">
      <q-card>
        <q-card-section>
          <div class="text-h6">Inbox Poruke</div>
        </q-card-section>
  
        <q-separator />
  
        <q-list bordered padding>
  
          <q-item v-for="(message, index) in messages" :key="index" clickable>
  
            <q-item-section>
              <q-item-label><strong>{{ message.sender }}</strong></q-item-label>
              <q-item-label caption>{{ message.content }}</q-item-label>
            </q-item-section>
  
            <q-item-section side top>
              <q-item-label caption>{{ formatDate(message.timestamp) }}</q-item-label>
            </q-item-section>
  
          </q-item>
  
        </q-list>
      </q-card>
    </q-page>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  // Staticka lista poruka
  const messages = ref([
    {
      sender: 'Marko',
      content: 'Bok, kako ide projekt?',
      timestamp: new Date('2025-04-25T14:30:00')
    },
    {
      sender: 'Dino',
      content: 'Vidimo se kasnije na sastanku.',
      timestamp: new Date('2025-04-25T15:00:00')
    },
    {
      sender: 'Alex',
      content: 'Jesi završio svoj dio koda?',
      timestamp: new Date('2025-04-25T16:15:00')
    },
    {
      sender: 'Borna',
      content: 'Imam novu ideju za dizajn!',
      timestamp: new Date('2025-04-25T17:45:00')
    }
  ])
  
  // Funkcija za formatiranje datuma i vremena
  function formatDate(date) {
    return new Intl.DateTimeFormat('hr-HR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date)
  }
  </script>
  
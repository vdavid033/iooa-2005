<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <q-btn 
        label="Pokaži poruku" 
        color="primary" 
        @click="showNotification('Ovo je kompletan tekst poruke...')"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'

const $q = useQuasar()

function showNotification(fullMessage) {
  const shortMessage = fullMessage.length > 30 
    ? fullMessage.substring(0, 30) + '...' 
    : fullMessage

  $q.notify({
    message: `
      <div>
        <div><strong>Ovo je dummy pošiljatelj</strong></div>
        <div style="margin-top: 5px; font-size: 0.9em">${shortMessage}</div>
      </div>
    `,
    color: 'positive',
    position: 'bottom-right',
    timeout: 5000,
    progress: true,
    html: true, // Omogućava HTML u poruci
    actions: [{ icon: 'close', color: 'white' }],
    icon: 'mail',
    transitionShow: 'fade',
    transitionHide: 'fade'
  })
}
</script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

let $q
let trenutniKorisnikId = ref(null)
let zadnjaProvjera = ref(new Date().toISOString())
let pollingInterval = null
let posljednjaPrikazanaPorukaId = null 

export function initNotificationService(app, korisnikId) {
    $q = useQuasar()
    trenutniKorisnikId.value = korisnikId
    startPolling()
  }

export function stopNotificationService() {
  stopPolling()
}

function startPolling() {
  stopPolling()
  pollingInterval = setInterval(checkForNewMessages, 3000)
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

async function checkForNewMessages() {
  try {
    if (!trenutniKorisnikId.value) return
    
    const response = await fetch(
      `http://localhost:3000/api/messages/new-messages/${trenutniKorisnikId.value}?lastCheck=${encodeURIComponent(zadnjaProvjera.value)}`
    )
    
    const newMessages = await response.json()
    zadnjaProvjera.value = new Date().toISOString()
    
    // Pronađi najnoviju poruku
    const najnovijaPoruka = newMessages.reduce((latest, current) => {
      return (!latest || new Date(current.datum_vrijeme) > new Date(latest.datum_vrijeme)) 
        ? current 
        : latest
    }, null)

    if (najnovijaPoruka && najnovijaPoruka.id_poruke !== posljednjaPrikazanaPorukaId) {
      showNotification(najnovijaPoruka)
      posljednjaPrikazanaPorukaId = najnovijaPoruka.id_poruke
    }
  } catch (error) {
    console.error('Greška pri provjeri novih poruka:', error)
  }
}

function showNotification(msg) {
    $q.notify({
      message: `${msg.ime_korisnika} ${msg.prezime_korisnika}: ${msg.sadrzaj.substring(0, 15)}${msg.sadrzaj.length > 15 ? '...' : ''}`,
      color: 'primary',
      position: 'bottom-right',
      timeout: 5000,
      actions: [
        {
          label: 'Otvori chat',
          color: 'black', 
          textColor: 'black', 
          handler: () => {
             window.location.href = `/poruke?user=${msg.posiljatelj}`
          }
        }
      ]
    })
  }
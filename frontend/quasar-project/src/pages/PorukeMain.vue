<template>
  <q-page class="row q-pa-md">
    <!-- Sidebar s kontaktima -->
    <div class="col-3 q-pr-md">
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Kontakti</div>
        </q-card-section>

        <q-card-section>
          <q-btn label="NOVI CHAT" icon="chat" class="q-mb-sm full-width" color="primary" />
          <q-btn label="NOVA GRUPA" icon="group_add" class="full-width" color="secondary" />
        </q-card-section>

        <q-separator />

        <q-list bordered padding>
          <q-item 
            clickable 
            v-for="chat in chats" 
            :key="chat.id_korisnika" 
            @click="selectChat(chat)"
            :active="selectedChat?.id_korisnika === chat.id_korisnika"
          >
            <q-item-section>
              <q-item-label>{{ chat.ime_korisnika }} {{ chat.prezime_korisnika }}</q-item-label>
              <q-item-label caption>
                {{ getLastMessagePreview(chat.id_korisnika) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label caption>
                {{ getLastMessageTime(chat.id_korisnika) }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <!-- Glavni chat prozor -->
    <div class="col-9">
      <q-card class="full-height">
        <q-card-section>
          <div class="text-h6">
            {{ selectedChat ? `${selectedChat.ime_korisnika} ${selectedChat.prezime_korisnika}` : 'Odaberi chat' }}
          </div>
        </q-card-section>

        <q-separator />

        <q-scroll-area ref="scrollAreaRef" style="height: 60vh">
          <div v-if="selectedChat">
            <div 
              v-for="(msg, index) in getMessagesForChat(selectedChat.id_korisnika)" 
              :key="index" 
              class="q-mb-sm row"
            >
              <div
                :class="[ 
                  'q-pa-sm rounded-borders',
                  msg.fromMe ? 'bg-green-3 text-right self-end' : 'bg-grey-3 text-left self-start'
                ]"
                :style="{
                  maxWidth: '60%',
                  marginLeft: msg.fromMe ? 'auto' : '12px', 
                  marginRight: msg.fromMe ? '12px' : 'auto',
                }"
              >
                {{ msg.sadrzaj }}
                <div class="text-caption text-grey-7">{{ formatTime(msg.datum_vrijeme) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-grey q-mt-md">Odaberi kontakt za prikaz poruka</div>
        </q-scroll-area>

        <q-separator />

        <q-card-actions>
          <q-input
            v-model="newMessage"
            placeholder="Napiši poruku..."
            class="col"
            @keyup.enter="sendMessage"
            dense
          />
          <q-btn icon="send" @click="sendMessage" round color="primary" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { jwtDecode } from "jwt-decode";

// Varijable stanja
const fullUser = ref({});
const newMessage = ref('')
const selectedChat = ref(null)
const scrollAreaRef = ref(null)
const chats = ref([])
const poruke = ref([])
const trenutniKorisnikId = ref(null)
const token = localStorage.getItem("token");

// Dohvaćanje podataka
const fetchKorisnici = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/korisnici/${trenutniKorisnikId.value}`);
    const data = await response.json();

    if (!response.ok) {
      console.error('Greška u odgovoru API-ja:', data);
      return;
    }

    chats.value = data;
  } catch (error) {
    console.error('Greška pri dohvaćanju korisnika:', error);
  }
};

const fetchSvePoruke = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/sve-poruke/${trenutniKorisnikId.value}`);
    if (!response.ok) {
      console.error('Greška u odgovoru API-ja:', await response.text());
      return;
    }
    const data = await response.json();
    poruke.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Greška pri dohvaćanju poruka:', error);
  }
};

const fetchPorukeZaKorisnika = async (korisnikId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/poruke/${trenutniKorisnikId.value}/${korisnikId}`);
    if (!response.ok) {
      console.error('Greška u odgovoru API-ja:', await response.text());
      return;
    }
    const novePoruke = await response.json();
    poruke.value = [
      ...poruke.value.filter(p => 
        !(p.posiljatelj === trenutniKorisnikId.value && p.primatelj === korisnikId) &&
        !(p.posiljatelj === korisnikId && p.primatelj === trenutniKorisnikId.value)
      ),
      ...novePoruke
    ];
  } catch (error) {
    console.error('Greška pri dohvaćanju poruka:', error);
  }
};

// Pomoćne funkcije
const getMessagesForChat = (korisnikId) => {
  return poruke.value
    .filter(poruka => 
      (poruka.posiljatelj === korisnikId && poruka.primatelj === trenutniKorisnikId.value) ||
      (poruka.posiljatelj === trenutniKorisnikId.value && poruka.primatelj === korisnikId)
    )
    .map(poruka => ({
      ...poruka,
      fromMe: poruka.posiljatelj === trenutniKorisnikId.value
    }))
    .sort((a, b) => new Date(a.datum_vrijeme) - new Date(b.datum_vrijeme))
}

const getLastMessagePreview = (korisnikId) => {
  const messages = getMessagesForChat(korisnikId)
  if (messages.length === 0) return 'Nema poruka!'
  const lastMsg = messages[messages.length - 1]
  return lastMsg.sadrzaj.length > 15 
    ? lastMsg.sadrzaj.substring(0, 25) + '...' 
    : lastMsg.sadrzaj
}

const getLastMessageTime = (korisnikId) => {
  const messages = getMessagesForChat(korisnikId)
  if (messages.length === 0) return ''
  return formatTime(messages[messages.length - 1].datum_vrijeme)
}

const formatTime = (datumVrijeme) => {
  if (!datumVrijeme) return ''
  const date = new Date(datumVrijeme)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Jučer'
  }
  return date.toLocaleDateString()
}

// Interakcije
const selectChat = async (chat) => {
  selectedChat.value = chat
  await fetchPorukeZaKorisnika(chat.id_korisnika)
  nextTick(() => scrollToBottom())
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) return
  try {
    await fetch('http://localhost:3000/api/poruke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sadrzaj: newMessage.value,
        posiljatelj: trenutniKorisnikId.value,
        primatelj: selectedChat.value.id_korisnika
      })
    })
    newMessage.value = ''
    await fetchPorukeZaKorisnika(selectedChat.value.id_korisnika)
    nextTick(() => scrollToBottom())
  } catch (error) {
    console.error('Greška pri slanju poruke:', error)
  }
}

const scrollToBottom = () => {
  scrollAreaRef.value?.setScrollPosition('vertical', 9999, 300)
}

const decodeToken = (token) => { 
  try { 
    return jwtDecode(token);
  } catch (error) {
    console.error("Greška pri dekodiranju tokena:", error); 
    return null; 
  } 
};

// Inicijalno učitavanje - obavijest o prijavi za prikaz poruka
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  if (!token) {
    alert("Morate biti prijavljeni da biste vidjeli poruke.")
    router.push('/login')
    return
  }

  const decoded = decodeToken(token)
  if (!decoded || !decoded.id) {
    alert("Nevažeći token. Prijavite se ponovno.")
    router.push('/login')
    return
  }

  fullUser.value = decoded
  trenutniKorisnikId.value = fullUser.value.id

  fetchKorisnici()
  fetchSvePoruke()
})

// Automatsko osvježavanje poruka
let pollingInterval = null

const startPolling = () => {
  stopPolling()
  pollingInterval = setInterval(async () => {
    if (selectedChat.value) {
      await fetchPorukeZaKorisnika(selectedChat.value.id_korisnika)
    }
  }, 3000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

watch(selectedChat, (newChat) => {
  if (newChat) {
    startPolling()
  } else {
    stopPolling()
  }
})

onUnmounted(() => {
  stopPolling()
})
</script>
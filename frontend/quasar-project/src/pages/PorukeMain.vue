<template>
  <q-page class="row q-pa-md">
    <!-- Sidebar s kontaktima -->
    <div class="col-3 q-pr-md">
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Veleri</div>
        </q-card-section>

        <q-card-section>
          <q-btn label="NEW CHAT" icon="chat" class="q-mb-sm full-width" color="primary" />
          <q-btn label="NEW GROUP" icon="group_add" class="full-width" color="secondary" />
        </q-card-section>

        <q-separator />

        <q-list bordered padding>
          <q-item clickable v-for="chat in chats" :key="chat.id" @click="selectChat(chat)">
            <q-item-section>
              <q-item-label>{{ chat.name }}</q-item-label>
              <q-item-label caption>{{ chat.lastMessage }}</q-item-label>
            </q-item-section>
            <q-item-section side v-if="chat.time">
              <q-item-label caption>{{ chat.time }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <!-- Glavni chat prozor -->
    <div class="col-9">
      <q-card class="full-height">
        <q-card-section>
          <div class="text-h6">{{ selectedChat?.name || 'Odaberi chat' }}</div>
        </q-card-section>

        <q-separator />

        <q-scroll-area ref="scrollAreaRef" style="height: 60vh">
          <div v-if="selectedChat">
            <div v-for="(msg, index) in selectedChat.messages" :key="index" class="q-mb-sm row">
              <div
                :class="[
                  'q-pa-sm rounded-borders',
                  msg.fromMe ? 'bg-green-3 text-right self-end' : 'bg-grey-3 text-left self-start'
                ]"
                :style="{
                  maxWidth: '60%',
                  marginLeft: msg.fromMe ? 'auto' : '0', 
                  marginRight: msg.fromMe ? '0' : 'auto'
                }"
              >
                {{ msg.text }}
                <div class="text-caption text-grey-7">{{ msg.time }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center text-grey q-mt-md">Odaberi kontakt za prikaz poruka</div>
        </q-scroll-area>

        <q-separator />

        <q-card-actions>
          <q-input
            v-model="newMessage"
            placeholder="Type a message"
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
import { ref, nextTick } from 'vue'

const newMessage = ref('')
const selectedChat = ref(null)
const scrollAreaRef = ref(null)

const chats = ref([
  {
    id: 1,
    name: 'Marko Linić',
    lastMessage: 'See you tomorrow!',
    time: '11:30',
    messages: [
      { text: 'See you tomorrow!', time: '11:30', fromMe: false }
    ]
  },
  {
    id: 2,
    name: 'Borna Rošić',
    lastMessage: 'Hello there!',
    time: '12:45',
    messages: [
      { text: 'Hello there!', time: '12:45', fromMe: false },
      { text: 'Hello Borna! How are you doing today', time: '12:47', fromMe: true },
      { text: 'Test', time: '23:27', fromMe: true }
    ]
  },
  {
    id: 3,
    name: 'Alex Bahorić',
    lastMessage: 'Meeting at 3pm',
    time: 'Jučer',
    messages: [
      { text: 'Meeting at 3pm', time: 'Jučer', fromMe: false }
    ]
  },
  {
    id: 4,
    name: 'Dino Turak',
    lastMessage: 'Check this out',
    time: 'Jučer',
    messages: [
      { text: 'Check this out', time: 'Jučer', fromMe: false }
    ]
  }
])

function selectChat(chat) {
  selectedChat.value = chat
  nextTick(() => {
    scrollToBottom()
  })
}

function sendMessage() {
  if (!newMessage.value.trim() || !selectedChat.value) return
  selectedChat.value.messages.push({
    text: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fromMe: true
  })
  newMessage.value = ''
  nextTick(() => {
    scrollToBottom()
  })
}

function scrollToBottom() {
  scrollAreaRef.value?.setScrollPosition('vertical', 9999, 300)
}
</script>

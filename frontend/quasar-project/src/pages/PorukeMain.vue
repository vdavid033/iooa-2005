<template>
    <q-layout view="hHh Lpr lFf">
      <!-- Lijevi drawer sa Essential Links i kontaktima -->
      <q-drawer 
        v-model="leftDrawerOpen" 
        show-if-above 
        bordered
        :width="280"
        class="bg-grey-2"
      >
        <q-scroll-area style="height: 100%;">
          <!-- Prvi dio - Essential Links -->
          <q-list>
            <q-item-label header>
              NAVIGACIJA
            </q-item-label>
  
            <EssentialLink
              v-for="link in essentialLinks"
              :key="link.title"
              v-bind="link"
            />
          </q-list>
  
          <q-separator />
  
          <!-- Drugi dio - Kontakti za chat -->
          <q-list>
            <q-item-label header>
              Kontakti
            </q-item-label>
  
            <q-btn 
              flat 
              label="NEW CHAT" 
              icon="add_comment" 
              class="full-width text-left q-pl-md"
            />
            <q-btn 
              flat 
              label="NEW GROUP" 
              icon="group_add" 
              class="full-width text-left q-pl-md"
            />
  
            <q-item 
              v-for="contact in contacts" 
              :key="contact.id"
              clickable
              v-ripple
              :active="selectedContact === contact.id"
              @click="selectContact(contact.id)"
            >
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white">
                  {{ contact.name.charAt(0) }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ contact.name }}</q-item-label>
                <q-item-label caption lines="1">{{ contact.lastMessage }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{ contact.time }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-drawer>
  
      <!-- Glavni sadržaj - chat prozor -->
      <q-page-container>
        <q-page class="row no-wrap">
          <div class="col column" style="min-width: 0;">
            <!-- Chat header -->
            <q-toolbar class="bg-grey-3">
              <q-btn
                flat
                dense
                round
                icon="menu"
                aria-label="Menu"
                @click="leftDrawerOpen = !leftDrawerOpen"
              />
              <q-toolbar-title v-if="selectedContact">
                {{ getContactName(selectedContact) }}
              </q-toolbar-title>
            </q-toolbar>
  
            <!-- Povijest razgovora -->
            <q-scroll-area class="col q-pa-md" style="height: calc(100vh - 130px);">
              <div class="text-caption text-center q-my-md">Today</div>
              
              <div 
                v-for="(message, index) in messages" 
                :key="index"
                :class="['q-pa-sm', message.sent ? 'text-right' : 'text-left']"
              >
                <q-chat-message
                  :text="[message.text]"
                  :sent="message.sent"
                  :stamp="message.time"
                />
              </div>
            </q-scroll-area>
  
            <!-- Input za novu poruku -->
            <q-footer class="bg-white">
              <q-toolbar>
                <q-input 
                  v-model="newMessage" 
                  placeholder="Type a message" 
                  dense 
                  rounded 
                  outlined 
                  class="full-width"
                  @keyup.enter="sendMessage"
                >
                  <template v-slot:after>
                    <q-btn 
                      round 
                      dense 
                      flat 
                      icon="send" 
                      @click="sendMessage"
                    />
                  </template>
                </q-input>
              </q-toolbar>
            </q-footer>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </template>
  
  <script>
  import EssentialLink from 'components/EssentialLink.vue'
  
  export default {
    name: 'PorukeMain',
    components: {
      EssentialLink
    },
    data() {
      return {
        leftDrawerOpen: true,
        selectedContact: 2,  
        newMessage: '',
        essentialLinks: [
          {
            title: 'Dashboard',
            caption: 'Glavna ploča',
            icon: 'dashboard',
            link: '/'
          }
          // Dodajte ostale linkove po potrebi
        ],
        contacts: [
          { id: 1, name: 'Marko Linić', lastMessage: 'Hello there!', time: '11:30' },
          { id: 2, name: 'Borna Rošić', lastMessage: 'Hello there!', time: '12:45' },
          { id: 3, name: 'Alex Bahorić', lastMessage: 'Hello there!', time: 'Yesterday' },
          { id: 4, name: 'Dino Turak', lastMessage: 'Hello there!', time: 'Yesterday' }
        ],
        messages: [
          { text: 'Hello there!', time: '12:45', sent: false },
          { text: 'Hello! How are you doing today', time: '12:47', sent: true }
        ]
      }
    },
    methods: {
      selectContact(contactId) {
        this.selectedContact = contactId
        // Ovdje bi dohvatili poruke za odabrani kontakt
      },
      sendMessage() {
        if (this.newMessage.trim() && this.selectedContact) {
          this.messages.push({
            text: this.newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sent: true
          })
          this.newMessage = ''
        }
      },
      getContactName(id) {
        const contact = this.contacts.find(c => c.id === id)
        return contact ? contact.name : ''
      }
    }
  }
  </script>
  
  <style scoped>
  .q-message-text {
    max-width: 70%;
  }
  </style>
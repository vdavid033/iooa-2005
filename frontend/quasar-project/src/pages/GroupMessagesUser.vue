<template>
  <q-layout view="hHh lpR fFf">
    <!-- LEFT: Popis grupa -->
    <q-drawer v-model="drawerOpen" show-if-above side="left" bordered class="bg-grey-1">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Grupe</q-toolbar-title>
        <q-btn flat round dense icon="add" @click="promptCreateGroup" />
      </q-toolbar>
      <q-list>
        <q-item v-for="(group, index) in groups" :key="index" clickable v-ripple
                @click="selectGroup(group)"
                :active="currentGroup?.name === group.name"
                active-class="bg-primary text-white">
          <q-item-section><q-item-label>{{ group.name }}</q-item-label></q-item-section>
          <q-item-section side>
            <q-btn dense flat round icon="logout" size="sm" color="negative" @click.stop="leaveGroup(index)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- RIGHT: Članovi grupe -->
    <q-drawer v-model="membersDrawer" side="right" bordered overlay class="bg-grey-1">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Članovi</q-toolbar-title>
        <q-btn flat round icon="close" @click="closeMembersDrawer" class="q-ml-auto" />
      </q-toolbar>
      <q-list>
        <q-item v-for="(member, index) in currentGroup?.members || []" :key="index">
          <q-item-section avatar><q-avatar><img :src="member.avatar" /></q-avatar></q-item-section>
          <q-item-section><q-item-label>{{ member.name }}</q-item-label></q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- SREDINA: Glavni prikaz poruka -->
    <q-page-container>
      <q-toolbar class="bg-primary text-white">
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" class="q-mr-sm" />
        <q-toolbar-title>{{ currentGroup?.name || '' }}</q-toolbar-title>
        <q-btn v-if="currentGroup" flat dense round icon="group" @click="membersDrawer = !membersDrawer" />
      </q-toolbar>

      <q-page class="q-pa-md flex flex-column bg-grey-2" style="height: calc(100vh - 100px);">
        <div v-if="currentGroup" class="q-pa-sm col overflow-auto" style="flex-grow: 1;">
          <div v-for="(msg, index) in messages" :key="index" class="q-mb-md">
            <q-chat-message :sent="msg.sent" :text="[msg.text]" :name="msg.name" :stamp="msg.time" :bg-color="msg.sent ? 'blue-3' : 'grey-4'" />
          </div>
        </div>
        <div v-else class="flex flex-center text-grey">
          <div>Odaberite grupu da biste započeli razgovor!</div>
        </div>
        <q-footer class="bg-white q-pa-sm">
          <div class="row items-center q-gutter-sm" v-if="currentGroup">
            <q-input v-model="newMessage" filled dense placeholder="Napiši poruku..." class="col" @keyup.enter="sendMessage" />
            <q-btn round dense color="primary" icon="send" @click="sendMessage" />
          </div>
        </q-footer>
      </q-page>
    </q-page-container>

    <!-- DIALOG: Kreiranje nove grupe -->
    <q-dialog v-model="createGroupDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Kreiraj novu grupu</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newGroupName" label="Ime grupe" />
          <div class="text-subtitle2 q-mt-md q-mb-xs">Označi članove:</div>
          <q-list>
            <q-item v-for="user in users" :key="user.id" clickable v-ripple>
              <q-item-section avatar><q-avatar><img :src="user.avatar" /></q-avatar></q-item-section>
              <q-item-section><q-item-label>{{ user.name }}</q-item-label></q-item-section>
              <q-item-section side><q-checkbox v-model="selectedUserIds" :val="user.id" /></q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Otkaži" color="primary" @click="cancelGroupCreation" />
          <q-btn flat label="Kreiraj" color="primary" @click="createGroup" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const users = ref([
  { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'David', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Mama', avatar: 'https://i.pravatar.cc/150?img=5' }
])
const groups = ref([]) // ← stvarne grupe se dohvaćaju s backend-a
const currentGroup = ref(null)
const messages = ref([]) // ← poruke su odvojene, više se ne čuvaju u currentGroup
const drawerOpen = ref(true)
const membersDrawer = ref(false)
const newMessage = ref('')
const createGroupDialog = ref(false)
const newGroupName = ref('')
const selectedUserIds = ref([])
const userId = 1 // testni user ID, zamijeni po potrebi

function selectGroup(group) {
  currentGroup.value = group
  fetchMessages() // ← dohvaćamo poruke s backend-a kad se odabere grupa
}

async function fetchMessages() {
  if (!currentGroup.value) return
  console.log("Fetch poruka za grupu:", currentGroup.value.name)
  try {
    const res = await axios.get(`http://localhost:3000/api/groups/${currentGroup.value.name}/messages`)
    messages.value = res.data.map(m => ({
      name: m.ime_korisnika,
      text: m.sadrzaj_grupne_poruke,
      time: new Date(m.datum_i_vrijeme_grupne_poruke).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sent: m.id_korisnika === userId
    }))
  } catch (err) {
    console.error('Greška pri dohvaćanju poruka:', err)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || !currentGroup.value) return
  try {
    await axios.post(`http://localhost:3000/api/groups/${currentGroup.value.name}/messages`, {
      senderId: userId,
      content: newMessage.value
    })
    newMessage.value = ''
    await fetchMessages()
  } catch (err) {
    console.error('Greška pri slanju poruke:', err)
  }
}

function promptCreateGroup() {
  newGroupName.value = ''
  selectedUserIds.value = []
  createGroupDialog.value = true
}

async function createGroup() {
  if (!newGroupName.value.trim()) return

  const selectedMembers = users.value.filter(user => selectedUserIds.value.includes(user.id))
  const memberIds = selectedMembers.map(u => u.id)

  try {
    const res = await axios.post('http://localhost:3000/api/groups', {
      name: newGroupName.value,
      description: 'Opis grupe', // možeš staviti tekst input kasnije ako želiš
      creatorId: userId,
      memberIds
    })

    // Nakon uspješnog kreiranja, dodaj grupu lokalno
    const newGroup = {
      name: res.data.ime_grupe,
      members: [...selectedMembers, { id: userId, name: 'Ja', avatar: 'https://i.pravatar.cc/150?img=6' }]
    }

    groups.value.push(newGroup)
    currentGroup.value = newGroup
    createGroupDialog.value = false
  } catch (err) {
    console.error('Greška pri kreiranju grupe:', err)
  }
}

function leaveGroup(index) {
  if (groups.value[index] === currentGroup.value) {
    currentGroup.value = newGroup
    messages.value = []
  }
  groups.value.splice(index, 1)
}

function cancelGroupCreation() {
  createGroupDialog.value = false
  newGroupName.value = ''
  selectedUserIds.value = []
}

function closeMembersDrawer() {
  membersDrawer.value = false
}

onMounted(() => {
  // Ovo možeš zamijeniti dohvatom grupa s backend-a ako postoji
  groups.value = [
    {
      name: 'Obitelj',
      members: [users.value[4], { id: userId, name: 'Ja', avatar: 'https://i.pravatar.cc/150?img=6' }]
    }
  ]
  currentGroup.value = groups.value[0]
  fetchMessages()
})
</script>

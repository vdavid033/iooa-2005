<template>
  <q-layout view="hHh lpR fFf">
    <!-- LEFT: Popis grupa -->
    <q-drawer v-model="drawerOpen" show-if-above side="left" bordered class="bg-grey-1">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Grupe</q-toolbar-title>
        <q-btn flat round dense icon="add" @click="promptCreateGroup" />
      </q-toolbar>
      <q-list>
        <q-item
          v-for="(group, index) in groups"
          :key="index"
          clickable
          v-ripple
          @click="selectGroup(group)"
          :active="currentGroup?.name === group.name"
          active-class="bg-primary text-white"
          class="q-mb-xs rounded-borders"
          style="transition: background 0.2s;"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="32px">
              <q-icon name="group" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ group.name }}</q-item-label>
            <q-item-label caption v-if="group.description">{{ group.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge v-if="group.unreadCount" color="red" floating>{{ group.unreadCount }}</q-badge>
            <q-btn dense flat round icon="delete" size="sm" color="negative" @click.stop="deleteGroup(group.name, index)" v-if="group.isAdmin" />
            <q-btn dense flat round icon="logout" size="sm" color="orange" @click.stop="leaveGroup(group.id, index)" />
          </q-item-section>
        </q-item>
      </q-list>
      <div style="display: flex; justify-content: center; width: 100%;">
        <q-btn icon="logout" label="ODJAVA" flat round dense @click="logout" class="q-ml-sm" />
      </div>
    </q-drawer>

    <!-- RIGHT: Članovi grupe -->
    <q-drawer v-model="membersDrawer" side="right" bordered overlay class="bg-grey-1">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Članovi</q-toolbar-title>
        <q-btn flat round icon="close" @click="closeMembersDrawer" class="q-ml-auto" />
      </q-toolbar>
      <q-list>
        <q-item
          v-for="(member, index) in (currentGroup?.members ? currentGroup.members.filter(m => m.id !== userId) : [])"
          :key="index"
          class="hoverable-member"
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-avatar><img :src="member.avatar" /></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ member.name }}</q-item-label>
          </q-item-section>
          <q-item-section>
            <q-btn icon="person_remove" color="negative" dense flat round @click="removeMemberFromGroup(member.id)" v-if="currentGroup?.isAdmin && member.id_korisnika !== userId"/>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-if="currentGroup?.isAdmin" style="display: flex; justify-content: center; padding: 10px 0; background-color: royalblue;" >
      <q-btn v-if="currentGroup?.isAdmin" flat round dense icon="person_add" color="white" @click="addMembersDialog = true" />
      </div>
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
            <q-chat-message
              :sent="msg.sent"
              :text="[msg.text]"
              :name="msg.name"
              :stamp="msg.time"
              :bg-color="msg.sent ? 'primary' : 'grey-3'"
              :text-color="msg.sent ? 'white' : 'black'"
              class="custom-chat-message"
            />
          </div>
        </div>
        <div v-else class="flex flex-center" style="height: 100%; min-height: 300px;">
          <div
            class="q-pa-xl bg-grey-1 text-primary text-center rounded-borders shadow-2"
            style="font-size: 1.3rem; font-weight: 500; max-width: 400px; margin: auto;"
          >
            <q-icon name="chat_bubble_outline" size="48px" color="primary" class="q-mb-md" />
            <div>Odaberite <span class="text-bold">grupu</span> s lijeve strane<br>da biste započeli razgovor.</div>
            <div class="text-caption text-grey-7 q-mt-sm">Kliknite na naziv grupe ili stvorite novu!</div>
          </div>
        </div>
        <q-footer class="bg-white q-pa-sm" :style="footerStyle">
          <div class="row items-center q-gutter-sm" v-if="currentGroup">
            <q-input v-model="newMessage" filled dense placeholder="Napiši poruku..." class="col" @keyup.enter="sendMessage" />
            <q-btn round dense color="primary" icon="send" @click="sendMessage" />
          </div>
        </q-footer>
      </q-page>
    </q-page-container>

    <!-- DIALOG: Kreiranje nove grupe -->
    <q-dialog v-model="createGroupDialog" persistent>
      <q-card style="min-width: 400px; border-radius: 10px;">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Kreiraj novu grupu</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newGroupName" label="Ime grupe" outlined dense :rules="[val => !!val || 'Ime je obavezno']" />
          <q-input v-model="newGroupDescription" label="Opis grupe" type="textarea" outlined dense class="q-mt-sm" />
          <div class="text-subtitle2 q-mt-md q-mb-xs">Označi članove:</div>
          <q-scroll-area class="q-mt-sm" style="height: 250px;">
            <q-list>
              <q-item v-for="user in users.filter(u => Number(u.id) !== Number(userId))" :key="user.id" tag="label" v-ripple>
                <q-item-section avatar>
                  <q-avatar><img :src="user.avatar" /></q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox v-model="selectedUserIds" :val="user.id" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-scroll-area>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Otkaži" color="grey-7" v-close-popup @click="cancelGroupCreation" />
          <q-btn label="Kreiraj" color="primary" @click="createGroup" :disable="!newGroupName.trim()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>

  <q-dialog v-model="addMembersDialog">
  <q-card>
    <q-card-section>
      <div class="text-h6">Dodaj članove u grupu</div>
    </q-card-section>

    <!-- DIALOG: Dodavanje osoba u grupu ako je korisnik admin -->
    <q-card-section>
      <div class="text-subtitle2 q-mb-xs">Označi korisnike za dodavanje:</div>
      <q-list>
        <q-item v-for="user in usersToAdd" :key="user.id" clickable v-ripple>
          <q-item-section avatar>
            <q-avatar><img :src="user.avatar" /></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ user.name }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-checkbox v-model="selectedUserIdsToAdd" :val="user.id" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Otkaži" color="primary" @click="addMembersDialog = false" />
      <q-btn flat label="Dodaj" color="primary" @click="addSelectedMembersToGroup" />
    </q-card-actions>
  </q-card>
</q-dialog>

<div>{{ users }}</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import { useQuasar } from 'quasar'
const $q = useQuasar()

import axios from 'axios'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import { jwtDecode } from "jwt-decode";

import { useRouter } from 'vue-router'

const users = ref([])

async function fetchUsers() {
  try {
    const res = await axios.get('http://localhost:3000/api/groups/users/all')
    users.value = res.data
  } catch (err) {
    console.error('Greška pri dohvaćanju korisnika:', err)
  }
}
const groups = ref([]) // ← stvarne grupe se dohvaćaju s backend-a
const currentGroup = ref(null)
const messages = ref([]) // ← poruke su odvojene, više se ne čuvaju u currentGroup
const drawerOpen = ref(true)
const membersDrawer = ref(false)
const newMessage = ref('')
const createGroupDialog = ref(false)
const newGroupName = ref('')
const selectedUserIds = ref([])
const router = useRouter()
const token = localStorage.getItem("token");
let userId = null;
if (!token) {
  // Redirect if no token
  router.push("/login");
} else {
  try {
    const decoded = jwtDecode(token);
    userId = decoded.id;
  } catch (error) {
    console.error("Invalid token");
    router.push("/login");
  }
}
const newGroupDescription = ref('')
const addMembersDialog = ref(false);
const selectedUserIdsToAdd = ref([]);
const usersToAdd = computed(() => {
  return users.value.filter(u => !currentGroup.value?.members?.some(m => m.id === u.id));
});

function logout() {
  // Clear token or user data from storage
  localStorage.removeItem('token')
  // Redirect to login page
  router.push('/login')
}

async function addSelectedMembersToGroup() {
  if (!currentGroup.value?.id) {
    console.warn('Group ID is missing. Cannot add members.');
    $q.notify({ type: 'negative', message: 'Grupa nije ispravno postavljena.' });
    return;
  }

  console.log('Group ID:', currentGroup.value.id);
  console.log('Group Name:', currentGroup.value.name);
  console.log('User IDs to add:', selectedUserIdsToAdd.value);

  try {
    await axios.post(`http://localhost:3000/api/groups/${currentGroup.value.id}/members`, {
      userIds: selectedUserIdsToAdd.value
    });

    $q.notify({ type: 'positive', message: 'Članovi su dodani u grupu.' });

    addMembersDialog.value = false;
    selectedUserIdsToAdd.value = [];

    await fetchGroupMembers(currentGroup.value.name);
  } catch (err) {
    console.error('Error adding members:', err);
    $q.notify({ type: 'negative', message: 'Greška pri dodavanju članova.' });
  }
}

async function fetchGroups() {
  try {
    const res = await axios.get(`http://localhost:3000/api/groups/${userId}`)
    groups.value = res.data.map(group => ({
      id: group.id_grupe,
      name: group.ime_grupe,
      description: group.opis_grupe,
      isAdmin: group.admin_status === 1
    }))
    console.log('Groups:', groups.value);
  } catch (err) {
    console.error('Greška pri dohvaćanju grupa:', err)
  }
}

function selectGroup(group) {
  currentGroup.value = group
  fetchGroupMembers(group.name)
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

async function fetchGroupMembers(groupName) {
  try {
    const res = await axios.get(`http://localhost:3000/api/groups/${groupName}/members`)
    currentGroup.value.members = res.data
  } catch (err) {
    console.error('Greška pri dohvaćanju članova grupe:', err)
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
  newGroupDescription.value = ''
  selectedUserIds.value = []
  fetchUsers()
  createGroupDialog.value = true
}

async function createGroup() {
  if (!newGroupName.value.trim()) {
    console.warn('Naziv grupe je prazan.');
    return;
  }

  const selectedMembers = users.value.filter(user => selectedUserIds.value.includes(user.id));
  const memberIds = selectedMembers.map(u => u.id);

  if (!memberIds.length) {
    console.warn('Nema odabranih članova.');
  }

  if (!userId) {
    console.warn('Korisnički ID nije definiran.');
  }

  const payload = {
    name: newGroupName.value,
    description: newGroupDescription.value || 'Opis grupe',
    creatorId: userId,
    memberIds
  };

  console.log('Kreiranje grupe sa sljedećim podacima:', payload);

  try {
    const res = await axios.post('http://localhost:3000/api/groups', payload);

    console.log('Odgovor servera:', res.data);

    // Nakon uspješnog kreiranja, dodaj grupu lokalno
    const newGroup = {
      id: res.data.id_grupe, // <== ADD THIS LINE
      name: res.data.ime_grupe || payload.name,
      members: [...selectedMembers],
      isAdmin: true
    };

    groups.value.push(newGroup);
    currentGroup.value = newGroup;
    createGroupDialog.value = false;
    console.log('Grupa je uspješno dodana lokalno.');
  } catch (err) {
    console.error('Greška pri kreiranju grupe:', err);
  }
}

async function leaveGroup(groupId, index) {
  // groupId here is the 'id' property from your group object
  try {
    await axios.post('http://localhost:3000/api/groups/leave', {
      userId: userId,
      groupId: groupId
    });

    groups.value.splice(index, 1);

    if (currentGroup.value?.id === groupId) {
      currentGroup.value = null;
    }

    console.log('Napustili ste grupu.');
  } catch (err) {
    console.error('Greška pri napuštanju grupe:', err);
  }
}

async function removeMemberFromGroup(memberId) {
  try {
    const res = await axios.delete(`http://localhost:3000/api/groups/${currentGroup.value.name}/members/${memberId}`);
    
    // Show backend's success message
    console.log("Odgovor servera:", res.data);
    $q.notify({
      type: 'positive',
      message: res.data.message || 'Član je uklonjen.'
    });

    // Refresh the member list to reflect the deletion
    await fetchGroupMembers(currentGroup.value.name);
  } catch (err) {
    console.error("Greška pri uklanjanju člana:", err);
    $q.notify({
      type: 'negative',
      message: err.response?.data?.error || 'Došlo je do greške pri uklanjanju člana.'
    });
  }
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
  if (userId) {
    fetchUsers();
    fetchGroups();
  }
});

/* BRISANJE KOMPLETNE GRUPE */
async function deleteGroup(groupName, index) {
  try {
    const response = await axios.delete(`http://localhost:3000/api/groups/${groupName}`)
    console.log(response.data.message)

    // Ukloni grupu iz prikaza
    groups.value.splice(index, 1)

    if (currentGroup.value?.name === groupName) {
      currentGroup.value = null
      messages.value = []
    }

    $q.notify({
      type: 'positive',
      message: 'Grupa je uspješno obrisana.'
    })
  } catch (err) {
    console.error('Greška pri brisanju grupe:', err)

    $q.notify({
      type: 'negative',
      message: err.response?.data?.error || 'Došlo je do greške pri brisanju grupe.'
    })
  }
}

const footerStyle = computed(() => {
  // Pretpostavljamo da je drawer širine 200px (default Quasar drawer), ali nije jer je u našem slučaju 300
  return drawerOpen.value
    ? { marginLeft: '300px', transition: 'margin 0.2s' }
    : { marginLeft: '0', transition: 'margin 0.2s' }
});
</script>

<style scoped>
.hoverable-member {
  border-radius: 8px;
  transition: background 0.2s;
}
.hoverable-member:hover {
  background: #e3f2fd;
  cursor: pointer;
}
.custom-chat-message .q-message {
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(60,60,60,0.07);
}
.rounded-borders {
  border-radius: 16px;
}
</style>
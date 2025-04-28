<template>
  <q-layout view="hHh lpR fFf">
    
    <!-- Left Drawer: Group List -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      side="left"
      bordered
      class="bg-grey-1"
    >
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
        >
          <q-item-section>
            <q-item-label>{{ group.name }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <q-btn dense flat round icon="logout" size="sm" color="negative" @click.stop="leaveGroup(index)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Right Drawer: Group Members -->
    <q-drawer
      v-model="membersDrawer"
      side="right"
      bordered
      overlay
      class="bg-grey-1"
    >
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>Članovi</q-toolbar-title>
        <q-btn
          flat
          round
          icon="close"
          @click="closeMembersDrawer"
          class="q-ml-auto"
        />
      </q-toolbar>

      <!-- Gumb za dodavanje novih članova -->
      <q-btn
        class="q-ma-sm"
        color="primary"
        label="Dodaj članove"
        icon="person_add"
        @click="addMembersDialog = true"
      />

      <!-- Lista članova -->
      <q-list>
        <q-item
          v-for="(member, index) in currentGroup?.members || []"
          :key="index"
        >
          <q-item-section avatar>
            <q-avatar>
              <img :src="member.avatar" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ member.name }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
            dense
            flat
            icon="delete"
            color="negative"
            size="sm"
            @click="removeMember(index)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- Main Page Content -->
    <q-page-container>
      <q-toolbar class="bg-primary text-white">
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" class="q-mr-sm" />
        <q-toolbar-title>{{ currentGroup?.name || '' }}</q-toolbar-title>

        <q-btn
          v-if="currentGroup"
          flat
          dense
          round
          icon="group"
          @click="membersDrawer = !membersDrawer"
        />
      </q-toolbar>

      <q-page class="q-pa-md flex flex-column bg-grey-2" style="height: calc(100vh - 100px);">
        <div v-if="currentGroup" class="q-pa-sm col overflow-auto" style="flex-grow: 1;">
          <div v-for="(msg, index) in currentGroup.messages" :key="index" class="q-mb-md">
            <q-chat-message
              :sent="msg.sent"
              :text="[msg.text]"
              :name="msg.name"
              :stamp="msg.time"
              :bg-color="msg.sent ? 'blue-3' : 'grey-4'"
            />
          </div>
        </div>

        <div v-else class="flex flex-center text-grey">
          <div>Odaberite grupu da biste započeli razgovor!</div>
        </div>

        <!-- Message Input -->
        <q-footer class="bg-white q-pa-sm">
          <div class="row items-center q-gutter-sm" v-if="currentGroup">
            <q-input
              v-model="newMessage"
              filled
              dense
              placeholder="Napiši poruku..."
              class="col"
              @keyup.enter="sendMessage"
            />
            <q-btn round dense color="primary" icon="send" @click="sendMessage" />
          </div>
        </q-footer>
      </q-page>
    </q-page-container>

    <!-- Dialog for Creating New Group -->
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
              <q-item-section avatar>
                <q-avatar>
                  <img :src="user.avatar" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ user.name }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-checkbox v-model="selectedUserIds" :val="user.id" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Otkaži" color="primary" @click="cancelGroupCreation" />
          <q-btn flat label="Kreiraj" color="primary" @click="createGroup" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ADD MEMBERS DIALOG -->
    <add-members-dialog
      v-model="addMembersDialog"
      :available-users="availableUsers"
      @add-members="handleAddMembers"
    />
    
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import ContactList from 'src/components/ContactList.vue'
import AddMembersDialog from 'src/components/AddMembersDialog.vue'

// Podaci
const users = ref([
  { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 4, name: 'David', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 5, name: 'Mama', avatar: 'https://i.pravatar.cc/150?img=5' }
])

const groups = ref([
  {
    name: 'Obitelj',
    members: [
      users.value[4],
      { id: 'ja', name: 'Ja', avatar: 'https://i.pravatar.cc/150?img=6' }
    ],
    messages: [
      { name: 'Mama', text: 'Javi se!', time: '6:00', sent: false }
    ]
  }
])

const currentGroup = ref(groups.value[0])

const drawerOpen = ref(true)
const membersDrawer = ref(false)
const newMessage = ref('')
const createGroupDialog = ref(false)
const newGroupName = ref('')
const selectedUserIds = ref([])
const addMembersDialog = ref(false)

// Computed za dostupne korisnike
const availableUsers = computed(() => {
  if (!currentGroup.value) return []
  return users.value.filter(user => 
    !currentGroup.value.members.some(member => member.id === user.id)
  )
})

// Funkcije
function selectGroup(group) {
  currentGroup.value = group
}

function sendMessage() {
  if (newMessage.value.trim() !== '' && currentGroup.value) {
    currentGroup.value.messages.push({
      name: 'Ja',
      text: newMessage.value,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      sent: true
    })
    newMessage.value = ''
  }
}

function promptCreateGroup() {
  newGroupName.value = ''
  selectedUserIds.value = []
  createGroupDialog.value = true
}

function createGroup() {
  if (newGroupName.value.trim() !== '') {
    const selectedMembers = users.value.filter(user => selectedUserIds.value.includes(user.id))
    const newGroup = {
      name: newGroupName.value,
      members: [...selectedMembers, { id: 'ja', name: 'Ja', avatar: 'https://i.pravatar.cc/150?img=6' }],
      messages: []
    }
    groups.value.push(newGroup)
    currentGroup.value = newGroup
    createGroupDialog.value = false
  }
}

function leaveGroup(index) {
  if (groups.value[index] === currentGroup.value) {
    currentGroup.value = null
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

function handleAddMembers(selectedUserIds) {
  const newMembers = users.value.filter(user => selectedUserIds.includes(user.id))
  if (currentGroup.value) {
    currentGroup.value.members.push(...newMembers)
  }
}
function removeMember(index) {
  if (currentGroup.value) {
    currentGroup.value.members.splice(index, 1)
  }
}
</script>

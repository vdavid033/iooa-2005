<template>
  <div>
    <!-- Unos komentara -->
    <q-input
      v-model="newComment"
      filled
      type="textarea"
      label="Napiši komentar..."
      autogrow
      class="q-mb-sm"
    />
    <q-btn
      label="Objavi komentar"
      color="primary"
      @click="addComment"
      :disable="!newComment.trim()"
      class="q-mb-lg"
    />

    <!-- Prikaz komentara -->
    <div v-if="comments.length">
      <q-list bordered separator>
        <q-item v-for="(comment, index) in sortedComments" :key="index">
          <q-item-section>
            <q-item-label>{{ comment.author }}:</q-item-label>
            <q-item-label caption>{{ comment.text }}</q-item-label>
            <q-item-label class="text-caption text-grey">{{ formatDate(comment.date) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div v-else class="text-grey">Još nema komentara.</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const newComment = ref('')
const comments = ref([
  { author: 'Ana', text: 'Super objava!', date: new Date().toISOString() },
  { author: 'Marko', text: 'Slažem se.', date: new Date().toISOString() }
])

const addComment = () => {
  if (newComment.value.trim()) {
    comments.value.unshift({
      author: 'Ti',
      text: newComment.value,
      date: new Date().toISOString()
    })
    newComment.value = ''
  }
}

const sortedComments = computed(() =>
  [...comments.value].sort((a, b) => new Date(b.date) - new Date(a.date))
)

const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleString('hr-HR')
}
</script>
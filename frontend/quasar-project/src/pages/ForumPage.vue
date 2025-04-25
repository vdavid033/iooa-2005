<template>
    <q-page padding>
      <div class="text-h4 q-mb-md">Forum</div>
  
      <div v-for="post in paginatedPosts" :key="post.id" class="q-mb-md">
        <q-card clickable @click="goToPost(post.id)" class="q-pa-sm">
          <q-card-section class="row items-center justify-between">
            <div>
              <q-avatar icon="person" size="sm" />
              <span class="q-ml-sm text-subtitle2">{{ post.author }}</span>
            </div>
            <div class="text-grey text-caption">&lt;{{ post.category }}&gt;</div>
          </q-card-section>
  
          <q-card-section>
            <div class="text-h6">{{ post.title }}</div>
            <div class="text-body2 q-mt-xs">{{ post.preview }}</div>
          </q-card-section>
  
          <q-card-section class="row items-center justify-between">
            <div class="text-blue">
              <span v-for="tag in post.tags" :key="tag" class="q-mr-sm">#{{ tag }}</span>
            </div>
            <div class="row items-center q-gutter-sm">
              <q-icon name="chat_bubble_outline" />
              <span>{{ post.comments }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
  
      <!-- PAGINACIJA -->
      <q-pagination
        v-model="page"
        :max="maxPage"
        max-pages="5"
        boundary-numbers
        color="primary"
        class="q-mt-md"
      />
    </q-page>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  // MOCK PODACI
  const posts = ref([
    {
      id: 1,
      author: 'Kolega Kolegić',
      category: 'Tehnička podrška',
      title: 'Naslov prve objave',
      preview: 'Ovo je kratki sadržaj prve objave...',
      tags: ['Python', 'Pomoć'],
      comments: 7,
      date: '2025-04-25'
    },
    {
      id: 2,
      author: 'Ana Studentić',
      category: 'Pitanja i odgovori',
      title: 'Druga tema',
      preview: 'Brzo pitanje vezano uz zadaću...',
      tags: ['Algoritmi', 'Zadaća'],
      comments: 3,
      date: '2025-04-24'
    },
    
  ])
  
  const page = ref(1)
  const perPage = 20
  
  const paginatedPosts = computed(() =>
    posts.value.slice((page.value - 1) * perPage, page.value * perPage)
  )
  
  const maxPage = computed(() =>
    Math.ceil(posts.value.length / perPage)
  )
  
  function goToPost(id) {
    router.push(`/objava/${id}`)
  }
  </script>
  
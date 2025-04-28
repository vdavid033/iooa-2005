<template>
  <div class="q-pa-md">
    <q-select
      v-model="selectedTags"
      :options="availableTags"
      label="Filtriraj po tagovima"
      multiple
      filled
      emit-value
      map-options
    />

    <q-btn
      label="Filtriraj"
      color="primary"
      class="q-mt-md"
      @click="filterPosts"
    />

    <div v-if="filteredPosts.length === 0 && selectedTags.length > 0" class="q-mt-md">
      <q-banner class="bg-grey-3 text-black">
        Nema objava s odabranim tagovima.
      </q-banner>
    </div>

    <div v-else class="q-mt-md">
      <q-card
        v-for="post in filteredPosts"
        :key="post._id"
        class="q-mb-md"
      >
        <q-card-section>
          <div class="text-h6">{{ post.title }}</div>
          <div class="text-caption">{{ post.date }} - {{ post.author }}</div>
          <div class="q-mt-sm">{{ post.content }}</div>
          <div class="q-mt-sm">
            <q-chip
              v-for="tag in post.tags"
              :key="tag"
              color="secondary"
              class="q-mr-sm"
            >
              {{ tag }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'TagFilterPage',
  data () {
    return {
      selectedTags: [],
      availableTags: [
        { label: 'Python', value: 'Python' },
        { label: 'Ispit', value: 'Ispit' },
        { label: 'Programiranje', value: 'Programiranje' }
      ],
      filteredPosts: [],
      allPosts: [ // MOCK PODACI ZA TESTIRANJE
        {
          _id: '1',
          title: 'Prva objava',
          content: 'Ova objava se tiče ispita iz Pythona.',
          author: 'Ana',
          date: '2025-04-25',
          tags: ['Python', 'Ispit']
        },
        {
          _id: '2',
          title: 'Druga objava',
          content: 'Netko traži pomoć oko programiranja.',
          author: 'Marko',
          date: '2025-04-24',
          tags: ['Programiranje']
        }
      ]
    }
  },
  methods: {
    async filterPosts () {
      // ako nema backend, lokalni podatci:
      this.filteredPosts = this.allPosts.filter(post =>
        post.tags.some(tag => this.selectedTags.includes(tag))
      )

      // kad backend proradi:
      /*
      try {
        const query = this.selectedTags.join(',')
        const res = await axios.get(`/api/posts?tags=${query}`)
        this.filteredPosts = res.data
      } catch (err) {
        console.error('Greška pri dohvaćanju objava:', err)
      }
      */
    }
  }
}
</script>

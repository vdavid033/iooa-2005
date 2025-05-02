<template>
  <div class="q-pa-md">
    <!-- Selekt za tagove -->
    <q-select
      v-model="selectedTags"
      :options="availableTags"
      label="Filtriraj po tagovima"
      multiple
      filled
      emit-value
      map-options
    />

    <!-- Gumb za filtriranje -->
    <q-btn
      label="Filtriraj"
      color="primary"
      class="q-mt-md"
      @click="filterPosts"
    />

    <!-- Poruka ako nema rezultata -->
    <div v-if="filteredPosts.length === 0 && selectedTags.length > 0" class="q-mt-md">
      <q-banner class="bg-grey-3 text-black">
        Nema objava s odabranim tagovima.
      </q-banner>
    </div>

    <!-- Prikaz filtriranih objava -->
    <div v-else class="q-mt-md">
      <q-card
        v-for="post in filteredPosts"
        :key="post.id"
        class="q-mb-md"
      >
        <q-card-section>
          <div class="text-h6">{{ post.title }}</div>
          <div class="text-caption">{{ post.date }} - {{ post.author }}</div>
          <div class="q-mt-sm">{{ post.preview }}</div>
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
      availableTags: [], // dinamčki dohvat s backenda
      filteredPosts: []
    }
  },
  async mounted () {
    // Dohvati dostupne tagove s backenda
    try {
      const res = await axios.get('/api/tagovi')
      this.availableTags = res.data
    } catch (err) {
      console.error(' Greška pri dohvaćanju tagova:', err)
    }
  },
  methods: {
    async filterPosts () {
      if (this.selectedTags.length === 0) {
        this.filteredPosts = []
        return
      }

      try {
        const query = this.selectedTags.join(',')
        const res = await axios.get(`/api/objave/filtrirane?tagovi=${query}`)
        this.filteredPosts = res.data
      } catch (err) {
        console.error(' Greška pri dohvaćanju objava:', err)
      }
    }
  }
}
</script>

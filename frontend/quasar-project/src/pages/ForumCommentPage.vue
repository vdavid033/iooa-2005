<template>
  <q-page class="q-pa-md">
    <!-- Placeholder za OBJAVU -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">[OVDJE ĆE BITI OBJAVA]</div>
        <div class="text-subtitle2 text-grey">Ovako će izgledati tekst objave kolegice.</div>
      </q-card-section>
    </q-card>

    <!-- Komponente za komentare -->
    <comment-section />
  </q-page>
</template>

<script setup>
import CommentSection from 'components/CommentSection.vue'
</script>
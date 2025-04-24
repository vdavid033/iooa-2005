<template>
    <q-page padding>
        <q-card class="q-pa-md">
            <q-card-section>
                <div class="text-h6">Nova objava</div>
            </q-card-section>  

            <q-card-section>
                <q-input v-model="title" label="Naslov objave" filled />
                <q-editor v-model="content" label="Sadržaj" class="q-mt-md" />

                <q-select
                    v-model="category"
                    :options="categories"
                    label="Kategorija"
                    filled
                    class="q-mt-md"
                />

                <q-select
                    v-model="tags"
                    :options="availableTags"
                    label="Tagovi"
                    multiple
                    filled
                    class="q-mt-md"
                    :hint="'Maksimalno 5 tagova'"
                    :rules="[val => val.length <= 5 || 'Dozvoljeno je do 5 tagova.']"
                />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn label="Spremi" color="primary" @click="savePost" />
            </q-card-actions>
        </q-card>
    </q-page>          
</template>

<script setup>
import { ref } from 'vue'

const title = ref('')
const content = ref('')
const category = ref(null)
const tags = ref([])

const categories = ['Pitanja i odgovori', 'Tehnička podrška', 'Razmjena materijala']
const availableTags = ['Python', 'Programiranje', 'Ispit', 'Frontend', 'Quasar']

function savePost() {
    if (title.value && content.value && category.value) {
        console.log('Objava spremljena:', {
        title: title.value,
        content: content.value,
        category: category.value,
        tags: tags.value,
    })
    } 
    else {
    alert('Popuni sva obavezna polja!')
    }
}
</script>

<template>
  <q-card class="file-explorer">
    <!-- Search komponenta -->
    <q-toolbar class="bg-grey-2 q-px-md q-py-sm">
      <q-input
        v-model="searchQuery"
        dense
        outlined
        clearable
        placeholder="Search files..."
        class="full-width"
        @keyup.enter="executeSearch"
        @update:model-value="onSearchInputChange"
      >
        <template v-slot:prepend>
          <q-icon name="search" @click="executeSearch" class="cursor-pointer" />         
        </template>
      </q-input>
    </q-toolbar>

    <!-- Lista fileova -->
    <q-list bordered separator>
      <template v-if="isSearching">
        <file-item 
          v-for="item in searchResults"
          :key="item.path"
          :item="item"
          @click="handleSearchItemClick"
        />
      </template>
      <template v-else>
        <file-item 
          v-for="item in files"
          :key="item.path"
          :item="item"
          @click="handleItemClick"
        />
      </template>
    </q-list>

    <!-- Prazna poruka kada nema rezultata -->
    <div v-if="isSearching && searchResults.length === 0" class="q-pa-md text-center text-grey">
      No results found for "{{ searchQuery }}"
    </div>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import FileItem from './FileItem.vue';
import fileApi from '../../services/fileApi.js';

// Props
const props = defineProps({
  rootPath: { type: String, default: '/' }
});

// Stanje
const currentPath = ref(props.rootPath);
const files = ref([]);
const searchQuery = ref('');
const searchResult = ref([]);
const isLoading = ref(false);
const error = ref(null);


// Computed properties
const isSearching = computed(() => searchQuery.value.length > 0);

// Metode
const fetchFiles = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    files.value = await fileApi.getFiles(currentPath.value);
  } catch (err) {
    error.value = 'Failed to load files';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

/*const handleSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }
  
  try {
    isLoading.value = true;
    searchResults.value = await fileApi.searchFiles(searchQuery.value);
  } catch (err) {
    error.value = 'Search failed';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};*/

const handleItemClick = (item) => {
  if (item.type === 'dir') {
    currentPath.value = item.path;
    fetchFiles();
  } else {
    // Handle file click (e.g., open preview, download, etc.)
    console.log('File clicked:', item);
  }
};

const handleSearchItemClick = (item) => {
  if (item.type === 'dir') {
    currentPath.value = item.path;
    searchQuery.value = '';
    fetchFiles();
  } else {
    // Handle file click from search results
    console.log('File clicked from search:', item);
  }
};


const onSearchInputChange = (value) =>{
  searchQuery.value = value;
  if(searchQuery.value.trim().length > 2){
   searchResult.value = [];
   executeSearch();
  }
};

const executeSearch = () =>{
  if (searchQuery.value.trim().length > 0) {
     handleSearch(searchQuery.value);
  } else {
   
    console.log('Please enter search term');
  }
};

const handleSearch = async (value) => {
  //alert('tu sam');
  searchResult.value = await fileApi.searchFiles(value);
 
};

// Lifecycle hooks
onMounted(() => {
  fetchFiles();
});

// Watch for rootPath changes
watch(() => props.rootPath, (newPath) => {
  currentPath.value = newPath;
  fetchFiles();
});


</script>

<style scoped>
.file-explorer {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  min-width: 250px;
}
</style>
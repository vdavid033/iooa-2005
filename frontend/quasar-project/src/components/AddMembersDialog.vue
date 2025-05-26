<template>
    <q-dialog
      :model-value="modelValue"
      @update:model-value="val => emit('update:modelValue', val)"
    >
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Dodaj članove u grupu</div>
        </q-card-section>
  
        <q-card-section>
          <q-option-group
            v-model="selectedUserIds"
            :options="availableUsers"
            type="checkbox"
          />
        </q-card-section>
  
        <q-card-actions align="right">
          <q-btn flat label="Odustani" @click="closeDialog" />
          <q-btn color="primary" label="Dodaj" @click="confirmSelection" />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template>
  
<script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    modelValue: Boolean,
    availableUsers: {
      type: Array,
      required: true
    }
  })
  
  const emit = defineEmits(['update:modelValue', 'add-members'])
  
  const selectedUserIds = ref([])
  
  function confirmSelection() {
    emit('add-members', selectedUserIds.value)
    emit('update:modelValue', false) // zatvori dialog
  }
  
  function closeDialog() {
    emit('update:modelValue', false)
  }
</script>
  
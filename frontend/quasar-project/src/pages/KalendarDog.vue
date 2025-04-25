<template>
  <div class="q-pa-md">
    
    <q-card>
      <q-card-section class="row justify-between items-center">
        <q-btn flat icon="chevron_left" @click="prevMonth" />
        <div class="text-h6">{{ currentMonthYear }}</div>
        <q-btn flat icon="chevron_right" @click="nextMonth" />
      </q-card-section>

      <div class="q-gutter-sm q-mt-sm calendar-grid">
        <div
          v-for="day in daysInMonth"
          :key="day.date"
          class="calendar-day"
          :class="{
            'highlight-today': isToday(day.date),
            'disabled-day': isPast(day.date)
          }"
          @click="handleDateClick(day.date)"
        >
          {{ day.date.getDate() }}
        </div>
      </div>
    </q-card>

    <!-- Event Modal -->
    <q-dialog v-model="showEventModal">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Dodaj događaj: {{ selectedDateFormatted }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.headline" label="Naslov" filled />
          <q-input v-model="form.description" label="Opis" type="textarea" filled />
          <q-input v-model="form.location" label="Lokacija" filled />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Odustani" v-close-popup />
          <q-btn color="primary" label="Spremi" @click="saveEvent" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'

const currentDate = ref(new Date())
const showEventModal = ref(false)
const selectedDate = ref(null)

const form = ref({
  headline: '',
  description: '',
  location: ''
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const numDays = new Date(year, month + 1, 0).getDate()

  return [...Array(numDays)].map((_, i) => ({
    date: new Date(year, month, i + 1)
  }))
})

const currentMonthYear = computed(() =>
  date.formatDate(currentDate.value, 'MMMM YYYY')
)

const selectedDateFormatted = computed(() =>
  selectedDate.value ? date.formatDate(selectedDate.value, 'DD-MM-YYYY') : ''
)

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1))
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1))
}

const handleDateClick = (dateObj) => {
  if (!isPast(dateObj)) {
    selectDate(dateObj)
  }
}

const selectDate = (dateObj) => {
  selectedDate.value = dateObj
  showEventModal.value = true
}

const saveEvent = () => {
  const eventData = {
    ...form.value,
    author: 'trenutniKorisnik', //trenutno logirani korisnik
    date: selectedDateFormatted.value
  }
  console.log('Spremanje eventa:', eventData)
  showEventModal.value = false
  form.value = { headline: '', description: '', location: '' }
}

// provjera je li dani dan danas
const isToday = (dayDate) => {
  const today = new Date()
  return (
    today.getDate() === dayDate.getDate() &&
    today.getMonth() === dayDate.getMonth() &&
    today.getFullYear() === dayDate.getFullYear()
  )
}

// onemogucuje prijasnje datume
const isPast = (dayDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dayDate)
  target.setHours(0, 0, 0, 0)
  return target < today
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}
.calendar-day {
  padding: 12px;
  text-align: center;
  background: #f0f0f0;
  cursor: pointer;
  border-radius: 8px;
}
.calendar-day:hover {
  background: #e0e0e0;
}
.highlight-today {
  background-color: #4caf50;
  color: white;
  font-weight: bold;
}
.disabled-day {
  background-color: #ddd;
  color: #999;
  pointer-events: none;
}
</style>

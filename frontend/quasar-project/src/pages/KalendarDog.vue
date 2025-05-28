<template>
  <div class="q-pa-md">

    <q-card>
  <q-card-section class="row justify-between items-center">
    <q-btn flat icon="chevron_left" @click="prevMonth" />
    <div class="text-h6">{{ currentMonthYear }}</div>
    <q-btn flat icon="chevron_right" @click="nextMonth" />
  </q-card-section>

  <!-- Dodano: Nazivi dana -->
  <div class="calendar-weekdays">
    <div v-for="day in ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']" :key="day" class="weekday">
      {{ day }}
    </div>
  </div>

  <!-- Mjesec -->
  <div style="padding: 20px" class="q-gutter-sm q-mt-sm calendar-grid">
    <!-- Popunjavanje praznih slotova na početku mjeseca -->
    <div v-for="n in leadingEmptyDays" :key="'empty-' + n" class="calendar-day empty-day"></div>

    <!-- Dani mjeseca -->
    <div
      v-for="day in daysInMonth"
      :key="day.date"
      class="calendar-day"
      :class="{
        'highlight-today': isToday(day.date),
        'disabled-day': isPast(day.date),
        'weekend-day': isWeekend(day.date),
        'has-event' : day.hasEvent
      }"
      @click="handleDateClick(day.date)"
    >
      {{ day.date.getDate() }}
    </div>
  </div>
    </q-card>
    <q-dialog v-model="showEventModal" @hide="resetEventModalState">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Dodaj događaj: {{ selectedDateFormatted }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.headline" label="Naslov" filled />
          <q-input v-model="form.description" label="Opis" type="textarea" filled />
          <q-input v-model="form.location" label="Lokacija" filled />

          <q-select
            v-model="form.category"
            :options="categoryOptions"
            label="Kategorija"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            filled
            class="q-mt-md"
          />

        </q-card-section>
        <q-select
             v-model="form.category"
             label="Kategorija"
              filled
             :options="['zabava', 'edukacija', 'volontiranje']"
            />

        <q-card-actions align="right">
          <q-btn flat label="Odustani" @click="cancelCreateEvent" />
          <q-btn color="primary" :label="isEditMode ? 'Spremi izmjene' : 'Spremi'" @click="isEditMode ? updateEvent() : saveEvent()"/>

        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Show Events Modal -->
    <q-dialog v-model="showDateModal">
      <q-card style="min-width: 900px">
        <q-card-section>
          <div class="text-h6">Događaji za: {{ selectedDateFormatted }}</div>
        </q-card-section>

        <q-card-section style="padding: 0 24px">
          <div class="row q-col-gutter-md q-pt-md">
            <div class="col text-center">
              <div class="text-subtitle2">Zabava</div>
              <q-separator inset />
            </div>
            <div class="col text-center">
              <div class="text-subtitle2">Edukacija</div>
              <q-separator inset />
            </div>
            <div class="col text-center">
              <div class="text-subtitle2">Volontiranje</div>
              <q-separator inset />
            </div>
          </div>

          <div style="max-height: 300px; overflow-y: auto; margin-bottom: 10px">
            <div class="row q-col-gutter-md">
              <div class="col text-center">
                <div v-for="event in events.zabava" :key="event.headline" class="q-mt-sm">
                  <q-btn flat dense :label="'🎉 ' + event.headline" @click="openEventDetails(event, 'Zabava')" />
                </div>
              </div>

              <div class="col text-center">
                <div v-for="event in events.edukacija" :key="event.headline" class="q-mt-sm">
                  <q-btn flat dense :label="'📚 ' + event.headline" @click="openEventDetails(event, 'Edukacija')" />
                </div>
              </div>

              <div class="col text-center">
                <div v-for="event in events.volontiranje" :key="event.headline" class="q-mt-sm">
                  <q-btn flat dense :label="'🤝 ' + event.headline" @click="openEventDetails(event, 'Volontiranje')" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" v-if="!isSelectedDatePast">
          <q-btn color="primary" label="Kreiraj događaj" @click="openCreateEventModal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showEventDetailModal">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Detalji događaja</div>
        </q-card-section>
        <q-card-actions align="right">

       <q-btn v-if="canEditEvent" flat label="Uredi" @click="editEvent" />
       <q-btn flat label="Zatvori" v-close-popup />
      </q-card-actions>

        <q-card-section>
          <div><strong>Naslov:</strong> {{ selectedEvent.headline }}</div>
          <div class="q-mt-sm"><strong>Kategorija:</strong> {{ selectedEvent.category }}</div>
          <div class="q-mt-sm">
            <strong>Opis:</strong> {{ selectedEvent.description || 'Nije unesen' }}
          </div>
          <div class="q-mt-sm">
            <strong>Lokacija:</strong> {{ selectedEvent.location || 'Nije unesena' }}
          </div>
          <div class="q-mt-sm">
            <strong>Vrijeme početka:</strong>
            {{ selectedEvent.time ? selectedEvent.time.slice(0, 5)+'h' : 'Nije uneseno' }}
          </div>

          <div class="q-mt-sm">
          <strong>Organizator:</strong> {{ selectedEvent.organizator || 'Nepoznat' }}
          </div>

        </q-card-section>

        <q-card-actions align="between">
          <!-- NOVO: Gumb za brisanje -->
           <q-btn color="primary" flat label="Uredi" v-if="!isEventInPast && canDeleteEvent" @click="editEvent"/>
          <q-btn color="negative" flat label="Obriši" v-if="!isEventInPast && canDeleteEvent" @click="deleteEvent" />
          <q-btn flat label="Zatvori" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { date } from 'quasar'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'

const currentDate = ref(new Date())
const showDateModal = ref(false)
const showEventModal = ref(false)
const selectedDate = ref(null)
const loggedInUserId = ref(null)
const isEditMode = ref(false)

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const decoded = jwtDecode(token)
      loggedInUserId.value = decoded.id
    } catch (e) {
      console.error('Greška pri dekodiranju tokena:', e)
    }
  }
})

const form = ref({
  headline: '',
  description: '',
  location: '',
  category: null
})

const categoryOptions = [
  { label: 'Zabava', value: 2 },
  { label: 'Edukacija', value: 3 },
  { label: 'Volontiranje', value: 4 }
]

const events = ref({
  zabava: [],
  edukacija: [],
  volontiranje: []
})

const currentMonthYear = computed(() =>
  date.formatDate(currentDate.value, 'MMMM YYYY')
)

const selectedDateFormatted = computed(() =>
  selectedDate.value ? date.formatDate(selectedDate.value, 'YYYY-MM-DD') : ''
)

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const numDays = new Date(year, month + 1, 0).getDate()

  return [...Array(numDays)].map((_, i) => {
    const dateObj = new Date(year, month, i + 1)
    const formatted = date.formatDate(dateObj, 'YYYY-MM-DD') // OVO JE KLJUČNO

    return {
      date: dateObj,
      hasEvent: highlightedDates.value.includes(formatted)
    }
  })
})

const firstDayOfMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month, 1)
})

const leadingEmptyDays = computed(() => {
  let weekday = firstDayOfMonth.value.getDay() // 0 (Ned) do 6 (Sub)
  if (weekday === 0) weekday = 7 // Pretvori Ned u 7 za europski redoslijed
  return weekday - 1 // Ponedjeljak = 0 praznih slotova
})

const isSelectedDatePast = computed(() => {
  if (!selectedDate.value) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = new Date(selectedDate.value)
  selected.setHours(0, 0, 0, 0)
  return selected < today
})

const fetchEventsForDate = async () => {
  try {
    const res = await axios.get(`http://localhost:3001/api/events/${selectedDateFormatted.value}`)
    const fetched = res.data

    // Kategorizacija po nazivu kategorije
    events.value = {
      zabava: fetched.filter(e => e.category === 'Zabava'),
      edukacija: fetched.filter(e => e.category === 'Edukacija'),
      volontiranje: fetched.filter(e => e.category === 'Volontiranje'),
    }
  } catch (err) {
    console.error('Greška prilikom dohvaćanja događaja:', err)
  }
}

const handleDateClick = (dateObj) => {
    selectDate(dateObj)
}

const selectDate = (dateObj) => {
  selectedDate.value = dateObj
  fetchEventsForDate()
  showDateModal.value = true
}

const openCreateEventModal = () => {
  showDateModal.value = false
  showEventModal.value = true
}

const cancelCreateEvent = () => {
  showEventModal.value = false
  showDateModal.value = true
  resetEventModalState()
}

const editEvent = () => {
  isEditMode.value = true
  showEventDetailModal.value = false
  showEventModal.value = true

  form.value = {
    headline: selectedEvent.value.headline,
    description: selectedEvent.value.description,
    location: selectedEvent.value.location,
    category: categoryOptions.find(c => c.label === selectedEvent.value.category)?.value || null
  }
}

const resetEventModalState = () => {
  isEditMode.value = false
  form.value = { headline: '', description: '', location: '', category: null }
}

const saveEvent = async () => {
  console.log('form.category:', form.value.category)
  const eventData = {
    headline: form.value.headline,
    description: form.value.description,
    location: form.value.location,
    categoryId: form.value.category,
    date: selectedDateFormatted.value,
    time: '12:00:00', // hardkodano zasad
    userId: 1 // koristi stvarni korisnički ID
  }

  try {
    await axios.post('http://localhost:3001/api/events', eventData)
    showEventModal.value = false
    form.value = { headline: '', description: '', location: '', category:null}
    fetchEventsForDate()
  } catch (err) {
    console.error('Greška pri spremanju događaja:', err)
  }
}

const deleteEvent = async () => {
  try {
    await axios.delete(`http://localhost:3001/api/events/${selectedEvent.value.id}`)
    showEventDetailModal.value = false
    fetchEventsForDate()
  } catch (err) {
    console.error('Greška pri brisanju događaja:', err)
  }
}

const updateEvent = async () => {
  const eventData = {
    headline: form.value.headline,
    description: form.value.description,
    location: form.value.location,
    categoryId: form.value.category,
    date: selectedDateFormatted.value,
    time: '12:00:00' // ili kasnije omogući uređivanje vremena
  }

  try {
    await axios.put(`http://localhost:3001/api/events/${selectedEvent.value.id}`, eventData)
    showEventModal.value = false
    isEditMode.value = false
    form.value = { headline: '', description: '', location: '', category: null }
    fetchEventsForDate()
  } catch (err) {
    console.error('Greška pri ažuriranju događaja:', err)
  }
}

const showEventDetailModal = ref(false)
const selectedEvent = ref({
  id: null,
  headline: '',
  category: '',
  description: '',
  location: '',
  time: '',
  userId: null,
  organizator: ''
})

const openEventDetails = (event, category) => {
  selectedEvent.value = {
    ...event,
    category: category,
    userId: event.userId,
    time: event.time,
    organizator: `${event.firstName} ${event.lastName}`
  }
  showEventDetailModal.value = true
}

const canDeleteEvent = computed(() => {
  if (!selectedEvent.value || !selectedEvent.value.userId || !loggedInUserId.value) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventDate = new Date(selectedDate.value)
  eventDate.setHours(0, 0, 0, 0)

  return (
    selectedEvent.value.userId === loggedInUserId.value &&
    eventDate >= today
  )
})

const getCategoryId = (name) => {
  if (name === 'Zabava') return 1
  if (name === 'Edukacija') return 2
  if (name === 'Volontiranje') return 3
  return 1
}

const highlightedDates = ref([])

const fetchHighlightedDates = async () => {
  const year = currentDate.value.getFullYear().toString()
  const month = (currentDate.value.getMonth() + 1).toString().padStart(2, '0')

  try {
    const res = await axios.get(`http://localhost:3001/api/events/dates/${year}/${month}`)
    console.log('Dohvaćeni datumi s događajima:', res.data)
    highlightedDates.value = res.data.map(d =>
  date.formatDate(new Date(d), 'YYYY-MM-DD')
)
  } catch (err) {
    console.error('Greška prilikom dohvaćanja datuma s događajima:', err)
  }
}

watch(currentDate, () => {
  fetchHighlightedDates()
}, { immediate: true })

const isWeekend = (dateObj) => {
  const day = dateObj.getDay() // 0 = Ned, 6 = Sub
  return day === 0 || day === 6
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1))
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1))
}

const isToday = (dayDate) => {
  const today = new Date()
  return (
    today.getDate() === dayDate.getDate() &&
    today.getMonth() === dayDate.getMonth() &&
    today.getFullYear() === dayDate.getFullYear()
  )
}

const isPast = (dayDate) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dayDate)
  target.setHours(0, 0, 0, 0)
  return target < today
}
const isEventInPast = computed(() => {
  if (!selectedDate.value || !selectedEvent.value.time) return false

  const now = new Date()

  const [hours, minutes] = selectedEvent.value.time.slice(0, 5).split(':').map(Number)

  const eventDateTime = new Date(selectedDate.value)
  eventDateTime.setHours(hours, minutes, 0, 0)

  return now > eventDateTime
})

</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-top: 10px;
}

.weekday {
  padding: 8px 0;
}

.weekend-day {
  color: red;
  font-weight: bold;
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

/*.disabled-day {
  background-color: #ddd;
  color: #999;
  pointer-events: none;
}*/

.text-subtitle2 {
  margin-bottom: 10px;
  font-weight: 500 !important;
  font-size: 28px !important;
}

.empty-day {
  background: transparent;
  pointer-events: none;
}

.has-event {
  background-color: #2196f3;
  color: #FFFFFF;
}

</style>
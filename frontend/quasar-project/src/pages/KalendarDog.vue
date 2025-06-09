<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="row justify-between items-center">
        <q-btn flat icon="chevron_left" @click="prevMonth" />
        <div class="text-h6">{{ currentMonthYear }}</div>
        <q-btn flat icon="chevron_right" @click="nextMonth" />
      </q-card-section>

      <div class="calendar-weekdays">
        <div v-for="day in ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']" :key="day" class="weekday">
          {{ day }}
        </div>
      </div>

      <div class="q-gutter-sm q-mt-sm calendar-grid" style="padding: 20px">
        <div v-for="n in leadingEmptyDays" :key="'empty-' + n" class="calendar-day empty-day"></div>
        <div
          v-for="day in daysInMonth"
          :key="day.date"
          class="calendar-day"
          :class="{
            'highlight-today': isToday(day.date),
            'disabled-day': isPast(day.date),
            'weekend-day': isWeekend(day.date),
            'has-event' : day.hasEvent && !isToday(day.date)
          }"
          @click="handleDateClick(day.date)"
        >
          {{ day.date.getDate() }}
        </div>
      </div>
    </q-card>

    <!-- Dialog za kreiranje/uređivanje -->
    <q-dialog v-model="showEventModal" @hide="resetEventModalState">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Dodaj događaj: {{ selectedDateFormatted }}</div>
        </q-card-section>

        <q-card-section>
          <q-form ref="formRef" @submit.prevent="handleSubmit">
          <q-input v-model="form.headline" label="Naslov" filled :rules="[val => !!val || 'Naslov je obavezan']" lazy-rules/>
          <q-input v-model="form.description" label="Opis" type="textarea" filled :rules="[val => !!val || 'Opis je obavezan']" lazy-rules/>
          <q-input v-model="form.location" label="Lokacija" filled :rules="[val => !!val || 'Lokacija je obavezna']" lazy-rules/>
          <q-input
            v-model="form.time"
            label="Vrijeme početka (HH:mm)"
            filled
            mask="##:##"
            hint="Primjer unosa: 14:30"
            :rules="[
              val => !!val || 'Vrijeme je obavezno',
              validateTime
            ]"
            lazy-rules
          />
          <q-input filled v-model="form.date" label="Datum" mask="####-##-##" readonly>
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="form.date" mask="YYYY-MM-DD" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

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
            :rules="[val => !!val || 'Kategorija je obavezna']"
            lazy-rules
          />
          <q-card-actions align="right">
          <q-btn flat label="Odustani" @click="cancelCreateEvent" />
          <q-btn color="primary" :label="isEditMode ? 'Spremi izmjene' : 'Spremi'" type="submit" />
        </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog za prikaz događaja -->
    <q-dialog v-model="showDateModal">
      <q-card style="min-width: 900px; padding: 20px;">
        <q-card-section>
          <div class="text-h6">Događaji za: {{ selectedDateFormatted }}</div>
        </q-card-section>

        <q-card-section style="padding: 0 24px">
          <div class="row q-col-gutter-md q-pt-md">
            <div class="col text-center" v-for="(title, key) in kategorije" :key="key">
              <div class="text-subtitle2">{{ title }}</div>
              <q-separator inset />
              <div v-for="event in events[key]" :key="event.headline" class="q-mt-sm">
                <q-btn flat dense @click="openEventDetails(event, title)">
                  {{ getCategoryIcon(key) + ' ' + event.headline }}
                  <q-tooltip class="event-tooltip">
                    <div><strong>📅 Datum:</strong> {{ selectedDateFormatted }}</div>
                    <div><strong>⏰ Vrijeme:</strong> {{ event.time || 'N/A' }}</div>
                    <div><strong>📍 Lokacija:</strong> {{ event.location || 'N/A' }}</div>
                    <div><strong>👤 Autor:</strong> {{ event.firstName || 'Nepoznat' }} {{ event.lastName || '' }}</div>
                  </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" v-if="!isEventOldDate">
          <q-btn color="primary" label="Kreiraj događaj" @click="openCreateEventModal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Detalji događaja -->
    <q-dialog v-model="showEventDetailModal">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Detalji događaja</div>
        </q-card-section>

        <q-card-section>
          <div><strong>Naslov:</strong> {{ selectedEvent.headline }}</div>
          <div><strong>Kategorija:</strong> {{ selectedEvent.category }}</div>
          <div><strong>Opis:</strong> {{ selectedEvent.description || 'Nije unesen' }}</div>
          <div><strong>Lokacija:</strong> {{ selectedEvent.location || 'Nije unesena' }}</div>
          <div><strong>Vrijeme početka:</strong> {{ selectedEvent.time ? selectedEvent.time.slice(0,5)+'h' : 'Nije uneseno' }}</div>
          <div><strong>Autor:</strong> {{ selectedEvent.organizator || 'Nepoznat' }}</div>
        </q-card-section>

        <q-card-actions align="between">
          <q-btn flat color="primary" label="Uredi" v-if="!isEventInPast && canDeleteEvent" @click="editEvent" />
          <q-btn flat color="negative" label="Obriši" v-if="!isEventInPast && canDeleteEvent" @click="confirmDeleteEvent" />
          <q-btn flat label="Zatvori" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showDeleteConfirm" persistent>
  <q-card>
    <q-card-section class="text-h6">
      Jeste li sigurni da želite obrisati događaj?
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Ne" v-close-popup />
      <q-btn flat label="Da" color="negative" @click="proceedWithDelete" />
    </q-card-actions>
  </q-card>
</q-dialog>

<q-dialog v-model="showSuccessDialog">
  <q-card>
    <q-card-section class="text-h6">
      Izmjene su uspješno spremljene.
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="U redu" v-close-popup />
    </q-card-actions>
  </q-card>
</q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { date } from 'quasar'
import { jwtDecode } from 'jwt-decode'

const currentDate = ref(new Date())
const selectedDate = ref(null)
const showDateModal = ref(false)
const showEventModal = ref(false)
const showEventDetailModal = ref(false)
const isEditMode = ref(false)
const loggedInUserId = ref(null)
const formRef = ref(null)
const showDeleteConfirm = ref(false)
const showSuccessDialog = ref(false)

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      const decoded = jwtDecode(token)
      loggedInUserId.value = decoded.id
    } catch (err) {
      console.error('Token greška:', err)
    }
  }
})

const form = ref({
  headline: '',
  description: '',
  location: '',
  category: null,
  time: '',
   date: ''
})

const normalizeTime = (timeStr) => {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':').map(s => s.padStart(2, '0'))
  return `${h}:${m}`
}

const validateTime = (val) => {
  if (!val || !selectedDate.value) return true

  const [h, m] = val.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return 'Unesite valjano vrijeme.'

  const selected = new Date(selectedDate.value)
  const now = new Date()
  const isToday = selected.toDateString() === now.toDateString()

  const selectedTime = new Date()
  selectedTime.setHours(h, m, 0, 0)

  const minimumTime = new Date()
  minimumTime.setHours(now.getHours() + 1, now.getMinutes(), 0, 0)

  // EDIT LOGIKA: ako uređujemo današnji event
  if (
    isEditMode.value &&
    selectedEvent.value.time &&
    isToday
  ) {
    const [oldH, oldM] = selectedEvent.value.time.split(':').map(Number)
    const oldTime = new Date()
    oldTime.setHours(oldH, oldM, 0, 0)

    if (selectedTime > oldTime) {
      // dozvoli novo vrijeme unaprijed, čak i ako krši minimumTime
      return true
    }
  }

  if (isToday && selectedTime < minimumTime) {
    return 'Vrijeme mora biti barem sat vremena unaprijed.'
  }

  return true
}

const categoryOptions = [
  { label: 'Zabava', value: 2 },
  { label: 'Edukacija', value: 3 },
  { label: 'Volontiranje', value: 4 }
]

const kategorije = {
  zabava: 'Zabava',
  edukacija: 'Edukacija',
  volontiranje: 'Volontiranje'
}

const events = ref({ zabava: [], edukacija: [], volontiranje: [] })

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

const currentMonthYear = computed(() => date.formatDate(currentDate.value, 'MMMM YYYY'))
const selectedDateFormatted = computed(() => selectedDate.value ? date.formatDate(selectedDate.value, 'YYYY-MM-DD') : '')

const fetchEventsForDate = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/events/${selectedDateFormatted.value}`)
    const fetched = res.data
    events.value = {
      zabava: fetched.filter(e => e.category === 'Zabava'),
      edukacija: fetched.filter(e => e.category === 'Edukacija'),
      volontiranje: fetched.filter(e => e.category === 'Volontiranje')
    }
  } catch (err) {
    console.error('Greška dohvaćanja događaja:', err)
  }
}

const handleSubmit = () => {
  if (isEditMode.value) {
    updateEvent()
  } else {
    saveEvent()
  }
}

const saveEvent = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) return

  const eventData = {
    headline: form.value.headline,
    description: form.value.description,
    location: form.value.location,
    categoryId: form.value.category,
    date: form.value.date || selectedDateFormatted.value,
    time: form.value.time,
    userId: loggedInUserId.value || 1
  }

  try {
    await axios.post('http://localhost:3000/api/events', eventData)
    resetEventModalState()
    fetchEventsForDate()
  } catch (err) {
    console.error('Greška pri spremanju:', err)
  }
}

const updateEvent = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) return

  const selectedDateTime = new Date(`${form.value.date}T${form.value.time || '00:00'}`)
  const now = new Date()

  if (selectedDateTime < now) {
    alert('Ne možete postaviti događaj u prošlost.')
    return
  }

  const eventData = {
    headline: form.value.headline,
    description: form.value.description,
    location: form.value.location,
    categoryId: form.value.category,
    date: form.value.date || selectedDateFormatted.value,
    time: form.value.time || '12:00:00'
  }

  try {
  const response = await axios.put(`http://localhost:3000/api/events/${selectedEvent.value.id}`, eventData)

  if (response.status === 200 && response.data?.message === 'Događaj ažuriran') {
    resetEventModalState()
    fetchEventsForDate()
    showSuccessDialog.value = true
  } else {
    console.warn('Ažuriranje nije uspjelo:', response)
  }
} catch (err) {
  console.error('Greška pri ažuriranju:', err)
}

}

const deleteEvent = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/events/${selectedEvent.value.id}`)
    showEventDetailModal.value = false
    fetchEventsForDate()
  } catch (err) {
    console.error('Greška pri brisanju:', err)
  }
}
const confirmDeleteEvent = () => {
  showDeleteConfirm.value = true
}
const proceedWithDelete = async () => {
  showDeleteConfirm.value = false
  await deleteEvent()
}

const openEventDetails = (event, category) => {
  selectedEvent.value = {
    ...event,
    category: category,
    time: event.time,
    organizator: `${event.firstName} ${event.lastName}`,
    userId: event.userId
  }
  showEventDetailModal.value = true
}

const editEvent = () => {
  isEditMode.value = true
  showEventDetailModal.value = false
  showEventModal.value = true
  form.value = {
    headline: selectedEvent.value.headline,
    description: selectedEvent.value.description,
    location: selectedEvent.value.location,
    category: categoryOptions.find(c => c.label === selectedEvent.value.category)?.value || null,
    time: selectedEvent.value.time,
    date: date.formatDate(selectedDate.value,'YYYY-MM-DD')
  }
}

const resetEventModalState = () => {
  showEventModal.value = false
  isEditMode.value = false
  form.value = {
    headline: '',
    description: '',
    location: '',
    category: null,
    time: ''
  }
}

const highlightedDates = ref([])

const fetchHighlightedDates = async () => {
  const year = currentDate.value.getFullYear()
  const month = (currentDate.value.getMonth() + 1).toString().padStart(2, '0')
  try {
    const res = await axios.get(`http://localhost:3000/api/events/dates/${year}/${month}`)
    highlightedDates.value = res.data.map(d => date.formatDate(new Date(d), 'YYYY-MM-DD'))
  } catch (err) {
    console.error('Greška pri dohvaćanju datuma:', err)
  }
}

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const numDays = new Date(year, month + 1, 0).getDate()
  return [...Array(numDays)].map((_, i) => {
    const dateObj = new Date(year, month, i + 1)
    const formatted = date.formatDate(dateObj, 'YYYY-MM-DD')
    return {
      date: dateObj,
      hasEvent: highlightedDates.value.includes(formatted)
    }
  })
})

const leadingEmptyDays = computed(() => {
  let weekday = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), 1).getDay()
  if (weekday === 0) weekday = 7
  return weekday - 1
})

const isWeekend = (dateObj) => [0, 6].includes(dateObj.getDay())
const isToday = (dayDate) => {
  const today = new Date()
  return today.toDateString() === dayDate.toDateString()
}
const isPast = (dayDate) => new Date(dayDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)
const isEventInPast = computed(() => {
  if (!selectedDate.value || !selectedEvent.value.time) return false
  const [h, m] = selectedEvent.value.time.split(':').map(Number)
  const eventDateTime = new Date(selectedDate.value)
  eventDateTime.setHours(h, m, 0, 0)
  return new Date() > eventDateTime
})
const isEventOldDate = computed(() => {
  if (!selectedDate.value) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0) // postavi vrijeme na početak dana

  const eventDate = new Date(selectedDate.value)
  eventDate.setHours(0, 0, 0, 0) // isto za datum događaja

  return eventDate < today
})

const handleDateClick = (dateObj) => {
  selectedDate.value = dateObj
  fetchEventsForDate()
  showDateModal.value = true
}

const openCreateEventModal = () => {
  showDateModal.value = false
  showEventModal.value = true
}

const cancelCreateEvent = () => {
  resetEventModalState()
  showDateModal.value = true
}

const canDeleteEvent = computed(() => {
  return selectedEvent.value.userId === loggedInUserId.value && !isPast(selectedDate.value)
})

watch(currentDate, fetchHighlightedDates, { immediate: true })

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1))
}
const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1))
}
const getCategoryIcon = (key) => {
  if (key === 'zabava') return '🎉'
  if (key === 'edukacija') return '📚'
  if (key === 'volontiranje') return '🤝'
  return '🗓️'
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
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
}
.empty-day {
  background: transparent;
  pointer-events: none;
}
.has-event {
  background-color: #2196f3;
  color: #fff;
}
.text-subtitle2 {
  margin-bottom: 10px;
  font-weight: 500 !important;
  font-size: 20px;
}

.event-tooltip {
  background-color: #2e2e2e;
  color: #ffffff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  font-size: 14px;
  max-width: 250px;
  line-height: 1.4;
}
</style>

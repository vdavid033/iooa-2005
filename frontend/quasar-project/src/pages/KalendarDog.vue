<template>
  <div class="q-pa-md">
    <q-card>
      <q-card-section class="row justify-between items-center">
        <q-btn flat icon="chevron_left" @click="prevMonth" />
        <div class="text-h6">{{ currentMonthYear }}</div>
        <q-btn flat icon="chevron_right" @click="nextMonth" />
      </q-card-section>

      <div style="padding: 20px" class="q-gutter-sm q-mt-sm calendar-grid">
        <div
          v-for="day in daysInMonth"
          :key="day.date"
          class="calendar-day"
          :class="{
            'highlight-today': isToday(day.date),
            'disabled-day': isPast(day.date),
          }"
          @click="handleDateClick(day.date)"
        >
          {{ day.date.getDate() }}
        </div>
      </div>
    </q-card>

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
          <q-btn flat label="Odustani" @click="cancelCreateEvent" />
          <q-btn color="primary" label="Spremi" @click="saveEvent" />
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
                  <q-btn
                    flat
                    dense
                    :label="'🎉 ' + event.headline"
                    @click="openEventDetails(event, 'Zabava')"
                  />
                </div>
              </div>

              <div class="col text-center">
                <div v-for="event in events.edukacija" :key="event.headline" class="q-mt-sm">
                  <q-btn
                    flat
                    dense
                    :label="'📚 ' + event.headline"
                    @click="openEventDetails(event, 'Edukacija')"
                  />
                </div>
              </div>

              <div class="col text-center">
                <div v-for="event in events.volontiranje" :key="event.headline" class="q-mt-sm">
                  <q-btn
                    flat
                    dense
                    :label="'🤝 ' + event.headline"
                    @click="openEventDetails(event, 'Volontiranje')"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn color="primary" label="Kreiraj događaj" @click="openCreateEventModal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Event Details Modal -->
    <q-dialog v-model="showEventDetailModal">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Detalji događaja</div>
        </q-card-section>

        <q-card-section>
          <div><strong>Naslov:</strong> {{ selectedEvent.headline }}</div>
          <div class="q-mt-sm"><strong>Kategorija:</strong> {{ selectedEvent.category }}</div>
          <div class="q-mt-sm">
            <strong>Opis:</strong> {{ selectedEvent.description || 'Nije unesen' }}
          </div>
          <div class="q-mt-sm">
            <strong>Lokacija:</strong> {{ selectedEvent.location || 'Nije unesena' }}
          </div>
        </q-card-section>

        <q-card-actions align="between">
          <!-- NOVO: Gumb za brisanje -->
          <q-btn color="negative" flat label="Obriši" @click="deleteEvent" />
          <q-btn flat label="Zatvori" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'

const currentDate = ref(new Date())
const showDateModal = ref(false)
const showEventModal = ref(false)
const selectedDate = ref(null)

const form = ref({
  headline: '',
  description: '',
  location: '',
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const numDays = new Date(year, month + 1, 0).getDate()

  return [...Array(numDays)].map((_, i) => ({
    date: new Date(year, month, i + 1),
  }))
})

const currentMonthYear = computed(() => date.formatDate(currentDate.value, 'MMMM YYYY'))

const selectedDateFormatted = computed(() =>
  selectedDate.value ? date.formatDate(selectedDate.value, 'DD-MM-YYYY') : ''
)

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1))
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1))
}

const events = {
  zabava: [
    { headline: 'Party Night', description: 'Opis', location: 'Kantrida' },
    { headline: 'Ljetni festival', description: '', location: '' },
    { headline: 'Noć igara', description: '', location: '' },
    { headline: 'Karnevalska parada', description: '', location: '' },
    { headline: 'Silent disco', description: '', location: '' },
    { headline: 'Kino pod zvijezdama', description: '', location: '' },
  ],
  edukacija: [
    { headline: 'Web Development', description: '', location: '' },
    { headline: 'Marketing Workshop', description: '', location: '' },
    { headline: 'Uvod u Python', description: '', location: '' },
    { headline: 'Tečaj javnog nastupa', description: '', location: '' },
    { headline: 'Osnove dizajna', description: '', location: '' },
    { headline: 'Radionica financijske pismenosti', description: '', location: '' },
  ],
  volontiranje: [
    { headline: 'Čišćenje plaže', description: '', location: '' },
    { headline: 'Pomaganje u azilu', description: '', location: '' },
    { headline: 'Sadnja drveća', description: '', location: '' },
    { headline: 'Podrška starijima', description: '', location: '' },
    { headline: 'Organizacija humanitarne utrke', description: '', location: '' },
    { headline: 'Prikupljanje hrane za socijalne kuhinje', description: '', location: '' },
  ],
}

const handleDateClick = (dateObj) => {
  if (!isPast(dateObj)) {
    selectDate(dateObj)
  }
}

const selectDate = (dateObj) => {
  selectedDate.value = dateObj
  showDateModal.value = true
}

const openCreateEventModal = () => {
  showDateModal.value = false
  showEventModal.value = true
}

const cancelCreateEvent = () => {
  showEventModal.value = false
  showDateModal.value = true
}

const showEventDetailModal = ref(false)
const selectedEvent = ref({
  headline: '',
  category: '',
  description: '',
  location: '',
})

const openEventDetails = (event, category) => {
  selectedEvent.value = {
    ...event,
    category: category,
  }
  showEventDetailModal.value = true
}

// NOVO: funkcija za brisanje
const deleteEvent = () => {
  console.log('Brisanje eventa:', selectedEvent.value)
  showEventDetailModal.value = false
}

const saveEvent = () => {
  const eventData = {
    ...form.value,
    author: 'trenutniKorisnik',
    date: selectedDateFormatted.value,
  }
  console.log('Spremanje eventa:', eventData)
  showEventModal.value = false
  form.value = { headline: '', description: '', location: '' }
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
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
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

.text-subtitle2 {
  margin-bottom: 10px;
  font-weight: 500 !important;
  font-size: 28px !important;
}
</style>

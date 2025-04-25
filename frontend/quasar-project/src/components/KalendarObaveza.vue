<template>
  <div class="row items-center justify-between q-mb-sm">
    <q-btn flat icon="chevron_left" @click="prevMonth" />
    <div class="text-h6">{{ formatMonthYear(currentDate) }}</div>
    <q-btn flat icon="chevron_right" @click="nextMonth" />
  </div>

  <div class="calendar-grid">
    <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
    <div v-for="day in daysInMonth" :key="day.date" class="calendar-cell">
      <div class="day-number">{{ day.day }}</div>
      <div class="obaveze">
        <div
          v-for="(o, index) in getObavezeForDate(day.date)"
          :key="index"
          class="obaveza"
          @click="klikNaObavezu(day.date, o)"
        >
          {{ o }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { date } from 'quasar'

const emit = defineEmits(['klikNaObavezu'])

const currentDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))

const obaveze = ref({
  '2025-06-12': ['Kolokvij'],
  '2025-06-14': ['Ispit', 'Predavanje'],
  '2025-06-25': ['Projekt'],
  '2025-05-25': ['Projekt'],
})

const dayNames = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']

function getObavezeForDate(datum) {
  return obaveze.value[datum] || []
}

function klikNaObavezu(datum, naziv) {
  console.log('Klik!', datum, naziv)
  emit('klikNaObavezu', { datum, naziv })
}

const daysInMonth = computed(() => {
  const start = date.startOfDate(currentDate.value, 'month')
  const end = date.endOfDate(currentDate.value, 'month')

  const days = []
  const startDay = new Date(start).getDay() || 7
  const totalDays = date.getDateDiff(end, start) + 1

  for (let i = 1 - (startDay - 1); i <= totalDays; i++) {
    const d = new Date(start)
    d.setDate(i)
    const datum = date.formatDate(d, 'YYYY-MM-DD')
    days.push({
      date: datum,
      day: d.getDate(),
    })
  }

  return days
})

function nextMonth() {
  currentDate.value = date.addToDate(currentDate.value, { months: 1 })
}
function prevMonth() {
  currentDate.value = date.subtractFromDate(currentDate.value, { months: 1 })
}
function formatMonthYear(d) {
  return date.formatDate(d, 'MMMM YYYY')
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.day-name {
  text-align: center;
  font-weight: bold;
  padding: 4px;
  background: #f0f0f0;
  border-radius: 4px;
}

.calendar-cell {
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 100px;
  padding: 4px;
  background: #fafafa;
  position: relative;
}

.day-number {
  font-weight: bold;
  margin-bottom: 4px;
}

.obaveza {
  font-size: 12px;
  background-color: #e3f2fd;
  margin: 2px 0;
  padding: 2px 4px;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  z-index: 10;
}
</style>

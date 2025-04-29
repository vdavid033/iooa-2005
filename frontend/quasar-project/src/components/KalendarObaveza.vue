<template>
  <div class="row items-center justify-between q-mb-sm">
    <q-btn flat icon="chevron_left" @click="prevMonth" />
    <div class="text-h6">{{ formatMonthYear(currentDate) }}</div>
    <q-btn flat icon="chevron_right" @click="nextMonth" />
  </div>

  <div class="calendar-grid">
    <div class="day-name" v-for="day in dayNames" :key="day">{{ day }}</div>
    <div
      v-for="day in daysInMonth"
      :key="day.date"
      class="calendar-cell"
      :class="getDensityClass(day.date)"
      @click="klikNaDan(day.date)"
    >
      <div class="day-number">{{ day.day }}</div>
      <div class="obaveze">
        <div
          v-for="(o, index) in getObavezeForDate(day.date)"
          :key="index"
          class="obaveza"
          :class="getColorClass(o.opis_obaveze)"
          @click.stop="klikNaObavezu(day.date, o)"
        >
          {{ o.opis_obaveze }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { date } from 'quasar'
import axios from 'axios'

const emit = defineEmits(['klikNaObavezu'])

const currentDate = ref(date.formatDate(new Date(), 'YYYY-MM-DD'))
const obaveze = ref({})

const dayNames = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']

function getObavezeForDate(datum) {
  return obaveze.value[datum] || []
}

function klikNaObavezu(datum, obaveza) {
  console.log('Klik na obavezu!', datum, obaveza)
  if (obaveza) {
    emit('klikNaObavezu', { datum, obaveza })
  } else {
    console.error('Obaveza nije definirana!')
  }
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

function klikNaDan(datum) {
  console.log('Klik na dan!', datum)
  emit('klikNaDan', datum)
}

function getColorClass(obaveza) {
  if (obaveza === 'kolokvij') {
    return 'kolokvij-color'
  } else if (obaveza === 'praktični zadatak') {
    return 'ispit-color'
  } else if (obaveza === 'predaja seminara') {
    return 'predavanje-color'
  } else {
    return 'ostale-obaveze-color'
  }
}

function getDensityClass(datum) {
  const obavezeForDay = getObavezeForDate(datum).length
  if (obavezeForDay === 0) {
    return 'low-density'
  } else if (obavezeForDay === 1) {
    return 'medium-density'
  } else {
    return 'high-density'
  }
}

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/obaveze')
    const data = response.data

    const grupirane = {}
    data.forEach((ob) => {
      const datum = date.formatDate(ob.datum_obaveze, 'YYYY-MM-DD')
      if (!grupirane[datum]) {
        grupirane[datum] = []
      }
      grupirane[datum].push(ob)
    })

    obaveze.value = grupirane
  } catch (err) {
    console.error('Greška pri dohvaćanju obaveza:', err)
  }
})
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
  cursor: pointer;
  transition: background-color 0.2s;
}
.calendar-cell:hover {
  background-color: #e0e0e0;
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

.kolokvij-color {
  background-color: #ffcc80;
}
.ispit-color {
  background-color: #ff7043;
}
.predavanje-color {
  background-color: #81c784;
}
.ostale-obaveze-color {
  background-color: #e3f2fd;

  .low-density {
    background-color: #e1f5fe !important;
  }
  .medium-density {
    background-color: #ffe0b2 !important;
  }
  .high-density {
    background-color: #ffccbc !important;
  }

  .obaveza-count {
    font-size: 10px;
    font-weight: bold;
    color: #333;
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: #fff;
    border-radius: 50%;
    padding: 2px 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

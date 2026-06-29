<script setup>
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  startDate: {
    type: String,
    default: '2024-09-01'
  },
  endDate: {
    type: String,
    default: '2024-10-29'
  }
})

const DAY_WIDTH = 34
const LEFT_COL_WIDTH = 180
const ROW_HEIGHT = 56
const weekMap = ['日', '一', '二', '三', '四', '五', '六']

// 开始时间和结束时间
const timeStart = computed(() => dayjs(props.startDate))
const timeEnd = computed(() => dayjs(props.endDate))

// 获取总天数
const totalDays = computed(() => {
  const days = timeEnd.value.diff(timeStart.value, 'day') + 1
  return Math.max(days, 1)
})

const timelineWidth = computed(() => totalDays.value * DAY_WIDTH)
console.log(timelineWidth.value)

// 获取天列表
const dayList = computed(() => {
  return Array.from({ length: totalDays.value }).map((item, index) => {
    const date = timeStart.value.add(index, 'day')
    return {
      key: date.format('YYYY-MM-DD'),
      day: date.format('D'),
      week: weekMap[date.day()],
      month: date.format('YYYY年M月')
    }
  })
})

// 获取月列表
const monthList = computed(() => {
  const list = []
  dayList.value.forEach((item) => {
    const last = list[list.length - 1]
    if (last && last.month === item.month) {
      last.span += 1
    } else {
      list.push({ month: item.month, span: 1 })
    }
  })
  return list
})

const renderRows = computed(() => {
  return props.rows.map((user) => {
    const bars = (user.stories || [])
      .map((story) => {
        const start = dayjs(story.expect_start_at)
        const end = dayjs(story.expect_end_at)
        if (!start.isValid() || !end.isValid()) return null
        if (end.isBefore(timeStart.value) || start.isAfter(timeEnd.value)) return null

        const drawStart = start.isBefore(timeStart.value) ? timeStart.value : start
        const drawEnd = end.isAfter(timeEnd.value) ? timeEnd.value : end
        const left = drawStart.diff(timeStart.value, 'day') * DAY_WIDTH
        const width = (drawEnd.diff(drawStart, 'day') + 1) * DAY_WIDTH
        const progress = Math.max(0, Math.min(Number(story.progress) || 0, 1))

        return {
          id: story.story_id,
          title: story.title,
          progressText: `${Math.round(progress * 100)}%`,
          style: {
            left: `${left}px`,
            width: `${width}px`
          },
          progressStyle: {
            width: `${Math.round(progress * 100)}%`
          }
        }
      })
      .filter(Boolean)

    return { ...user, bars }
  })
})
</script>

<template>
  <section class="rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="flex">
      <div
        class="flex-shrink-0 border-r border-slate-200 bg-slate-50"
        :style="{ width: `${LEFT_COL_WIDTH}px` }"
      >
        <div class="h-[52px] border-b border-slate-200 px-3 pt-4 text-xs text-slate-400">成员</div>
        <div
          v-for="row in renderRows"
          :key="row.user_id"
          class="border-b border-slate-100 px-3 py-2"
          :style="{ height: `${ROW_HEIGHT}px` }"
        >
          <p class="text-sm font-medium text-slate-700">{{ row.name }}</p>
          <p class="text-xs text-slate-400">{{ row.position }}</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <div :style="{ width: `${timelineWidth}px` }">
          <div class="border-b border-slate-200 bg-slate-50">
            <div class="flex h-7 border-b border-slate-200">
              <div
                v-for="item in monthList"
                :key="item.month"
                class="border-r border-slate-200 px-2 text-xs leading-7 text-slate-600"
                :style="{ width: `${item.span * DAY_WIDTH}px` }"
              >
                {{ item.month }}
              </div>
            </div>
            <div class="flex h-[24px]">
              <div
                v-for="item in dayList"
                :key="item.key"
                class="border-r border-slate-100 text-center text-[11px] text-slate-500"
                :style="{ width: `${DAY_WIDTH}px` }"
              >
                <span>{{ item.day }}</span>
                <span class="mx-1 text-slate-300">|</span>
                <span>{{ item.week }}</span>
              </div>
            </div>
          </div>

          <div
            v-for="row in renderRows"
            :key="row.user_id"
            class="gantt-row relative border-b border-slate-100"
            :style="{ height: `${ROW_HEIGHT}px` }"
          >
            <div
              v-for="item in dayList"
              :key="`${row.user_id}-${item.key}`"
              class="absolute top-0 h-full border-r border-slate-100"
              :style="{ left: `${dayjs(item.key).diff(timeStart, 'day') * DAY_WIDTH}px`, width: `${DAY_WIDTH}px` }"
            />

            <div
              v-for="bar in row.bars"
              :key="bar.id"
              class="task-bar absolute top-[15px] h-6 overflow-hidden rounded-[3px] bg-amber-400 text-white"
              :style="bar.style"
              :title="bar.title"
            >
              <div class="h-full bg-emerald-500" :style="bar.progressStyle" />
              <span class="absolute left-1 top-0 z-10 whitespace-nowrap text-[11px] leading-6">
                {{ bar.progressText }} {{ bar.title }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gantt-row {
  background-color: #fff;
}

.task-bar {
  min-width: 28px;
}
</style>

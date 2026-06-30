<script setup>
import { computed, ref } from "vue";
import dayjs from "dayjs";
import { CaretBottom, CaretTop } from "@element-plus/icons-vue";

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  startDate: {
    type: String,
    default: "2024-09-01",
  },
  endDate: {
    type: String,
    default: "2024-10-29",
  },
});

const DAY_WIDTH = 34; // 固定天宽
const LEFT_COL_WIDTH = 100; // 左侧固定宽度列
const MIN_ROW_HEIGHT = 60; // 最小行高
const BAR_HEIGHT = 24; // 任务条高度
const BAR_GAP = 8; // 任务条间距
const BAR_TOP_PADDING = 10; // 任务条顶部留白
const BAR_BOTTOM_PADDING = 10; // 任务条底部留白
const weekMap = ["日", "一", "二", "三", "四", "五", "六"];
const COLLAPSE_LIMIT = 3; // 超过3条任务时显示折叠按钮
const BODY_MAX_HEIGHT = 600; // 表格最大高度

const collapsedUserIds = ref(new Set());
const textRefMap = ref({});
const overflowMap = ref({});
const leftBodyRef = ref(null);
const rightBodyRef = ref(null);
const isSyncingScroll = ref(false);
const hoverRowId = ref(null);
const hoverColKey = ref("");

// 开始时间和结束时间
const timeStart = computed(() => dayjs(props.startDate));
const timeEnd = computed(() => dayjs(props.endDate));

// 获取总天数
const totalDays = computed(() => {
  const days = timeEnd.value.diff(timeStart.value, "day") + 1;
  return Math.max(days, 1);
});

const timelineWidth = computed(() => totalDays.value * DAY_WIDTH);

// 获取天列表
const dayList = computed(() => {
  return Array.from({ length: totalDays.value }).map((item, index) => {
    const date = timeStart.value.add(index, "day");
    return {
      key: date.format("YYYY-MM-DD"),
      day: date.format("D"),
      week: weekMap[date.day()],
      month: date.format("YYYY年M月"),
    };
  });
});

// 获取月列表
const monthList = computed(() => {
  const list = [];
  dayList.value.forEach((item) => {
    const last = list[list.length - 1];
    if (last && last.month === item.month) {
      last.span += 1;
    } else {
      list.push({ month: item.month, span: 1 });
    }
  });
  return list;
});

const renderRows = computed(() => {
  return props.rows.map((user) => {
    const visibleBars = (user.stories || [])
      .map((story) => {
        const start = dayjs(story.expect_start_at); // 任务条开始时间
        const end = dayjs(story.expect_end_at); // 任务条结束时间
        if (!start.isValid() || !end.isValid()) return null; // 任务条开始时间或结束时间无效
        if (end.isBefore(timeStart.value) || start.isAfter(timeEnd.value))
          return null; // 任务条不在时间范围内

        const drawStart = start.isBefore(timeStart.value)
          ? timeStart.value
          : start; // 任务条开始时间
        const drawEnd = end.isAfter(timeEnd.value) ? timeEnd.value : end; // 任务条结束时间
        const left = drawStart.diff(timeStart.value, "day") * DAY_WIDTH; // 任务条左偏移
        const width = (drawEnd.diff(drawStart, "day") + 1) * DAY_WIDTH; // 任务条宽度
        const progress = Math.max(0, Math.min(Number(story.progress) || 0, 1)); // 进度条进度
        const progressPercent = progress * 100;

        return {
          id: story.story_id, // 任务条id
          title: story.title, // 任务条标题
          drawStart,
          drawEnd,
          progressText: `${Math.round(progress * 100)}%`, // 进度条文本
          progress,
          left,
          width,
          progressStyle: {
            width: `${progressPercent}%`, // 进度条宽度
          },
        };
      })
      .filter(Boolean);

    // 同一行任务如果时间重叠，自动放到下一层，避免任务条盖在一起
    const sortedBars = visibleBars.sort((a, b) => {
      if (a.drawStart.isBefore(b.drawStart)) return -1;
      if (a.drawStart.isAfter(b.drawStart)) return 1;
      return a.drawEnd.diff(b.drawEnd, "day");
    });

    const canToggle = sortedBars.length > COLLAPSE_LIMIT;
    const isCollapsed = collapsedUserIds.value.has(user.user_id);
    const displayBars =
      canToggle && isCollapsed
        ? sortedBars.slice(0, COLLAPSE_LIMIT)
        : sortedBars;

    // 简单模式：每条任务都单独占一行，不复用同一水平线
    const bars = displayBars.map((bar, index) => {
      const laneIndex = index;
      const top = BAR_TOP_PADDING + laneIndex * (BAR_HEIGHT + BAR_GAP);
      return {
        ...bar,
        style: {
          left: `${bar.left}px`,
          width: `${bar.width}px`,
          top: `${top}px`,
          height: `${BAR_HEIGHT}px`,
          backgroundColor: bar.progress === 1 ? "#0eae59" : "#ffab00",
        },
      };
    });

    const laneCount = bars.length;
    const rowHeight = Math.max(
      MIN_ROW_HEIGHT,
      BAR_TOP_PADDING +
        BAR_BOTTOM_PADDING +
        laneCount * BAR_HEIGHT +
        Math.max(laneCount - 1, 0) * BAR_GAP
    );

    return { ...user, bars, rowHeight, canToggle, isCollapsed };
  });
});

function toggleRow(userId) {
  const next = new Set(collapsedUserIds.value);
  if (next.has(userId)) {
    next.delete(userId);
  } else {
    next.add(userId);
  }
  collapsedUserIds.value = next;
}

function setTextRef(key, el) {
  if (!el) {
    delete textRefMap.value[key];
    delete overflowMap.value[key];
    return;
  }
  textRefMap.value[key] = el;
}

function checkOverflow(key) {
  const el = textRefMap.value[key];
  console.log(el)
  if (!el) return false;
  console.log(el.scrollWidth, el.clientWidth)
  const isOverflow = el.scrollWidth > el.clientWidth;
  overflowMap.value[key] = isOverflow;
  return isOverflow;
}

function isTextOverflow(key) {
  return !!overflowMap.value[key];
}

function syncVerticalScroll(target, source) {
  if (!target || !source || isSyncingScroll.value) return;
  isSyncingScroll.value = true;
  target.scrollTop = source.scrollTop;
  requestAnimationFrame(() => {
    isSyncingScroll.value = false;
  });
}

function onLeftBodyScroll(event) {
  syncVerticalScroll(rightBodyRef.value, event.target);
}

function onRightBodyScroll(event) {
  syncVerticalScroll(leftBodyRef.value, event.target);
}

function onCellEnter(rowId, colKey) {
  hoverRowId.value = rowId;
  hoverColKey.value = colKey;
}

function onCellLeave() {
  hoverRowId.value = null;
  hoverColKey.value = "";
}

const hoverColStyle = computed(() => {
  if (!hoverColKey.value) return null;
  const colIndex = dayList.value.findIndex((item) => item.key === hoverColKey.value);
  if (colIndex < 0) return null;
  return {
    left: `${colIndex * DAY_WIDTH}px`,
    width: `${DAY_WIDTH}px`,
  };
});
</script>

<template>
  <section class="overflow-hidden border border-slate-200 bg-white shadow-sm">
    <div class="flex">
      <div
        class="flex-shrink-0 border-r border-slate-200 bg-white"
        :style="{ width: `${LEFT_COL_WIDTH}px` }"
      >
        <div
          class="h-[80px] border-b border-slate-200 px-3 pt-4 text-xs text-slate-400"
        >
        </div>
        <div
          ref="leftBodyRef"
          class="overflow-y-auto overflow-x-hidden"
          :style="{ maxHeight: `${BODY_MAX_HEIGHT}px` }"
          @scroll="onLeftBodyScroll"
        >
          <div
            v-for="row in renderRows"
            :key="row.user_id"
            class="relative border-b border-slate-100 px-3 py-2"
            :class="{ 'hover-row-shadow': hoverRowId === row.user_id }"
            :style="{ height: `${row.rowHeight}px` }"
          >
            <p class="text-sm font-medium text-slate-700">{{ row.name }}</p>
            <p class="text-xs text-slate-400">{{ row.position }}</p>
            <button
              v-if="row.canToggle"
              type="button"
              class="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 cursor-pointer"
              @click="toggleRow(row.user_id)"
            >
              <el-icon :size="12">
                <CaretBottom v-if="row.isCollapsed" />
                <CaretTop v-else />
              </el-icon>
            </button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto flex-1 min-w-0">
        <div :style="{ width: `${timelineWidth}px` }">
          <div class="border-b border-slate-200 bg-white">
            <div class="flex h-[40px] border-b border-slate-200">
              <!-- 月列表 -->
              <div
                v-for="item in monthList"
                :key="item.month"
                class="border-r border-slate-200 px-2 text-xs font-bold flex items-center"
                :style="{ width: `${item.span * DAY_WIDTH}px` }"
              >
                {{ item.month }}
              </div>
            </div>
            <!-- 天列表 -->
            <div class="flex h-[40px]">
              <div
                v-for="item in dayList"
                :key="item.key"
                class="border-r border-slate-100 text-center text-[11px] flex flex-col items-center justify-center"
                :class="{ 'hover-col-shadow': hoverColKey === item.key }"
                :style="{ width: `${DAY_WIDTH}px` }"
                @mouseenter="onCellEnter(null, item.key)"
                @mouseleave="onCellLeave"
              >
                <div>{{ item.day }}</div>
                <div>{{ item.week }}</div>
              </div>
            </div>
          </div>

          <div
            ref="rightBodyRef"
            class="overflow-y-auto overflow-x-hidden"
            :style="{ maxHeight: `${BODY_MAX_HEIGHT}px` }"
            @scroll="onRightBodyScroll"
          >
            <div
              v-for="row in renderRows"
              :key="row.user_id"
              class="gantt-row relative border-b border-slate-100"
              :class="{ 'hover-row-shadow': hoverRowId === row.user_id }"
              :style="{ height: `${row.rowHeight}px` }"
            >
              <div
                v-if="hoverColStyle"
                class="col-hover-layer absolute top-0 h-full"
                :style="hoverColStyle"
              />
              <div
                v-for="item in dayList"
                :key="`${row.user_id}-${item.key}`"
                class="absolute top-0 h-full border-r border-slate-100"
                :style="{ left: `${dayjs(item.key).diff(timeStart, 'day') * DAY_WIDTH}px`, width: `${DAY_WIDTH}px` }"
                @mouseenter="onCellEnter(row.user_id, item.key)"
                @mouseleave="onCellLeave"
              />
              <div
                v-for="bar in row.bars"
                :key="bar.id"
                class="task-bar absolute z-[2] overflow-hidden rounded-[3px] text-white"
                :style="bar.style"
                :title="bar.title"
              >
                <div
                  v-if="bar.progress > 0 && bar.progress < 1"
                  class="h-full bg-[#0eae59]"
                  :style="bar.progressStyle"
                />
                <el-popover
                  placement="top"
                  trigger="hover"
                  :disabled="!isTextOverflow(`${row.user_id}-${bar.id}`)"
                  :content="`${bar.progressText} ${bar.title}`"
                >
                  <template #reference>
                    <span
                      :ref="(el) => setTextRef(`${row.user_id}-${bar.id}`, el)"
                      class="absolute left-1 right-1 top-0 z-10 block truncate text-[11px] leading-6"
                      @mouseenter="checkOverflow(`${row.user_id}-${bar.id}`)"
                    >
                      {{ bar.progressText }} {{ bar.title }}
                    </span>
                  </template>
                </el-popover>
              </div>
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

.col-hover-layer {
  z-index: 0;
  background-color: rgb(231, 238, 246);
  pointer-events: none;
}

.hover-row-shadow {
  box-shadow: inset 0 0 0 9999px rgb(247, 248, 249);
}

.hover-col-shadow {
  box-shadow: inset 0 0 0 9999px rgb(231, 238, 246);
}
</style>

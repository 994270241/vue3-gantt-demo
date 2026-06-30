<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import GanttHeader from "../components/GanttHeader.vue";
import GanttBoard from "../components/GanttBoard.vue";
import { getListData } from "../api/gantt";

const rows = ref([]);
const loading = ref(false);
const errorMsg = ref("");
const searchParams = reactive({
  member: [],
  startDate: "2024-09-01",
  endDate: "2024-10-29",
});

const memberOptions = [
  { label: "Streep", value: "streep" },
  { label: "Portman", value: "portman" },
  { label: "Swift", value: "swift" },
  { label: "Gadot", value: "gadot" },
  { label: "Lemon", value: "lemon" },
  { label: "Sam", value: "sam" },
  { label: "Tony", value: "tony" },
];

// 成员 + 时间筛选
const filteredRows = computed(() => {
  const selected = new Set(searchParams.member);
  const start = searchParams.startDate;
  const end = searchParams.endDate;

  return rows.value
    .filter((row) => {
      if (!selected.size) return true;
      return selected.has(String(row.name || "").toLowerCase());
    })
    .map((row) => {
      const stories = (row.stories || []).filter((story) => {
        // 在时间范围内显示数据
        return story.expect_start_at <= end && story.expect_end_at >= start;
      });
      return { ...row, stories };
    });
});

// 开始时间不能大于结束时间
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startDisabledDate = (date) => {
  if (!searchParams.endDate) return false;
  return formatDate(date) > searchParams.endDate;
};

// 结束时间不能小于开始时间
const endDisabledDate = (date) => {
  if (!searchParams.startDate) return false;
  return formatDate(date) < searchParams.startDate;
};

async function loadRows() {
  loading.value = true;
  errorMsg.value = "";
  try {
    rows.value = await getListData();
  } catch (error) {
    errorMsg.value = error.message || "数据加载失败";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRows();
});
</script>

<template>
  <main class="min-h-screen overflow-x-hidden">
    <div class="space-y-3">
      <GanttHeader />
      <div class="px-4">
        <section class="h-[86px] flex items-center">
          <div
            class="flex items-center gap-3 overflow-x-auto whitespace-nowrap"
          >
            <div class="min-w-[180px] flex items-center gap-2">
              <span class="text-sm">成员</span>
              <el-select
                v-model="searchParams.member"
                placeholder="请选择成员"
                clearable
                multiple
                class="w-full"
              >
                <el-option
                  v-for="item in memberOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm">开始时间</span>
              <el-date-picker
                v-model="searchParams.startDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="开始日期"
                :clearable="false"
                :editable="false"
                :disabled-date="startDisabledDate"
              />
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm">结束时间</span>
              <el-date-picker
                v-model="searchParams.endDate"
                type="date"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                placeholder="结束日期"
                :clearable="false"
                :editable="false"
                :disabled-date="endDisabledDate"
              />
            </div>
          </div>
        </section>
        <section
          v-if="loading"
          class="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
        >
          数据加载中...
        </section>
        <section
          v-else-if="errorMsg"
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-500 shadow-sm"
        >
          {{ errorMsg }}
        </section>
        <GanttBoard
          v-else
          :rows="filteredRows"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
:deep(.el-select__wrapper) {
  border-radius: 9999px !important;
  overflow: hidden !important;
}
</style>

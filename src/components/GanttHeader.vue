<script setup>
import { reactive } from 'vue'

const searchParams = reactive({
  member: '',
  startDate: '2024-09-01',
  endDate: '2024-10-29'
})

const memberOptions = [
  { label: '全部成员', value: '' },
  { label: 'Streep', value: 'streep' },
  { label: 'Portman', value: 'portman' },
  { label: 'Swift', value: 'swift' }
]
</script>

<template>
  <header class="py-3">
    <div class="flex items-center gap-3 overflow-x-auto whitespace-nowrap">
      <span class="text-sm">成员</span>
      <el-select
        v-model="searchParams.member"
        placeholder="请选择成员"
        class="!w-[170px]"
        clearable
        popper-class="select-popper"
      >
        <el-option
          v-for="item in memberOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <span class="ml-3 text-sm">开始时间</span>
      <el-date-picker
        v-model="searchParams.startDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="开始日期"
        class="!w-[170px]"
      />

      <span class="text-sm">结束时间</span>
      <el-date-picker
        v-model="searchParams.endDate"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="结束日期"
        class="!w-[170px]"
      />
    </div>
  </header>
</template>

<style scoped>
:deep(.el-select__wrapper) {
  border-radius: 9999px !important;
  overflow: hidden !important;
}
</style>

<script setup>
import { ref } from 'vue'
import { ChatLineSquare } from '@element-plus/icons-vue'

const activeTab = ref('stat')
</script>

<template>
  <header class="overflow-hidden bg-white mx-0 my-0">
    <div class="flex items-center justify-between border-b border-slate-200 px-4">
      <div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span class="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-xs text-white">Q</span>
        <span>企业QA</span>
      </div>

      <el-tabs v-model="activeTab" class="header-tabs" stretch>
        <el-tab-pane label="需求" name="requirement" />
        <el-tab-pane label="任务" name="task" />
        <el-tab-pane label="统计" name="stat" />
      </el-tabs>

      <div class="flex items-center gap-4 text-xs text-slate-500">
        <div class="flex items-center gap-1 text-[#0c7ae6]">
          <el-icon :size="14">
            <ChatLineSquare />
          </el-icon>
          <span class="text-sm">我的工作(测试部署)</span>
        </div>
        <el-avatar :size="28">J</el-avatar>
        <span>Jesse</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
:deep(.header-tabs .el-tabs__header) {
  margin: 0;
  height: 50px;
}

:deep(.header-tabs .el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.header-tabs .el-tabs__item) {
  height: 50px;
}
</style>

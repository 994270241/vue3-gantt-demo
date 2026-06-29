<script setup>
import GanttHeader from '../components/GanttHeader.vue'
import GanttBoard from '../components/GanttBoard.vue'
import source from '../mock.json'

const rows = source.data || []
</script>

<template>
  <main class="min-h-screen bg-slate-100 p-4 md:p-6">
    <div class="space-y-3">
      <GanttHeader />
      <GanttBoard :rows="rows" />
    </div>
  </main>
</template>

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages project path.
  base: '/vue3-gantt-demo/',
  plugins: [vue()],
})

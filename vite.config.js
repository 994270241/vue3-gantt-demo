import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // Use relative assets so the app works on GitHub Pages.
  base: './',
  plugins: [vue()],
})

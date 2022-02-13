import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/d3-gallery/',
  target:['edge90','chrome90','firefox90','safari15']
})

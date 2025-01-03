import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  base: '/ai-object-identifier/',
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar()
  ]
})
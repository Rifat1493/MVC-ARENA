import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'

const { version } = createRequire(import.meta.url)('./package.json')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    // Stamped onto every telemetry row so sessions from a buggy deploy can be
    // excluded during analysis.
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})

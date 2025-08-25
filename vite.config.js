import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const devTarget = env.VITE_DEV_PROXY || 'http://127.0.0.1:8000'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      port: 5174,
      open: true,
      proxy: {
        '/api': { target: devTarget, changeOrigin: true },
        '/health': { target: devTarget, changeOrigin: true },
      },
    },

    preview: {
      port: 4174,
      proxy: {
        '/api': { target: devTarget, changeOrigin: true },
        '/health': { target: devTarget, changeOrigin: true },
      },
    },
  }
})

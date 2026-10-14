import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { version as appVersion } from './package.json' with { type: 'json' }

export default defineConfig({
  define: {
    global: 'globalThis',
    // Single source of truth: the update checker compares this with the
    // latest GitHub release tag, so version bumps only touch package.json.
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://astro-talk-lnx5.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'https://astro-talk-lnx5.onrender.com',
        ws: true,
        secure: false,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
})

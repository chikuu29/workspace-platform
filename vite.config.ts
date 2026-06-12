import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import createVersionPlugin from './plugin/vite-plugin-version/index'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, process.cwd())
  const analyzeBuild = mode === 'analyze'

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    plugins: [
      react(),
      createVersionPlugin(),
      analyzeBuild &&
      visualizer({
        filename: './dist/stats.html',
        open: true,
      }),
    ],

    build: {
      target: 'esnext',
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 800,

      rollupOptions: {
        output: {
          /**
           * Chunk strategy (load order awareness):
           *
           *  react-core    → always first, tiny, cached forever
           *  chakra        → all @chakra-ui/* in one chunk (they share internals)
           *  emotion       → peer dep of chakra, loaded in parallel
           *  framer        → peer dep of chakra, loaded in parallel
           *  redux         → app-wide state bootstrap
           *  forms         → feature-level, often not on every page
           *  utils         → small helpers
           *  vendor        → everything else (safe fallback)
           */
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            // ── React core ──────────────────────────────────────────────────
            // Include scheduler (react-dom's internal dep) to avoid it
            // fragmenting into vendor and breaking react-dom chunk integrity.
            if (
              /node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)
            ) {
              return 'react-core'
            }

            // ── Chakra UI ───────────────────────────────────────────────────
            // Chakra primitives — tiny, always needed, load immediately
            if (
              id.includes('@chakra-ui/system') ||
              id.includes('@chakra-ui/theme') ||
              id.includes('@chakra-ui/utils') ||
              id.includes('@chakra-ui/anatomy') ||
              id.includes('@ark-ui') // Chakra v3 uses Ark UI under the hood
            ) {
              return 'chakra-system'
            }

            // Chakra component implementations — large, but cached after first visit
            if (id.includes('@chakra-ui')) {
              return 'chakra-components'
            }

            // ── Emotion ─────────────────────────────────────────────────────
            // Peer dep of Chakra. Separate chunk = parallel load with chakra.
            if (id.includes('@emotion')) {
              return 'emotion'
            }

            // ── Framer Motion ───────────────────────────────────────────────
            // Peer dep of Chakra. Same reasoning as emotion above.
            if (id.includes('framer-motion')) {
              return 'framer'
            }

            // ── Redux ────────────────────────────────────────────────────────
            if (id.includes('@reduxjs') || id.includes('react-redux')) {
              return 'redux'
            }

            // ── Forms ────────────────────────────────────────────────────────
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms'
            }

            // ── Utils ────────────────────────────────────────────────────────
            if (
              id.includes('axios') ||
              id.includes('uuid') ||
              id.includes('crypto-js')
            ) {
              return 'utils'
            }

            // ── ECharts & Graphics ───────────────────────────────────────────
            if (id.includes('echarts') || id.includes('zrender')) {
              return 'echarts'
            }

            // ── Vendor fallback ──────────────────────────────────────────────
            // Anything unmatched (date-fns, lodash, etc.) lands here.
            // Monitor dist/stats.html to catch new large deps accumulating.
            return 'vendor'
          },
        },
      },
    },

    server: {
      port: 5174,
      hmr: { overlay: true },
      proxy: {
        '/backend': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ''),
        },
        '/ui-api': {
          target: env.VITE_UI_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ui-api/, ''),
        },
        '/identity': {
          target: env.VITE_IDENTITY_PROVIDER_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/identity/, ''),
        },
      },
    },
  }
})

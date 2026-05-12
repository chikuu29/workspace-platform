import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import createVersionPlugin from './plugin/vite-plugin-version/index'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const env = loadEnv(mode, process.cwd())

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    plugins: [
      react(),
      createVersionPlugin(),
      mode === 'production' &&
        visualizer({
          filename: './dist/stats.html',
          open: true,
        }),
    ],

    build: {
      target: 'esnext',
      cssCodeSplit: true,
      sourcemap: false,

      // removed terser (important)
      // minify: 'esbuild' (default)

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          chunkFileNames: 'chunks/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
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
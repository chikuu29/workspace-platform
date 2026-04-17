import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import createVersionPlugin from './plugin/vite-plugin-version/index'; // Adjust the path as needed
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

import { fileURLToPath } from 'url';
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const env = loadEnv(mode, process.cwd());
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      react(),
      visualizer({
        filename: './dist/stats.html',
        open: true
      }),
      createVersionPlugin(),
      tsconfigPaths()
    ],
    build: {
      chunkSizeWarningLimit: 2000, // Set higher limit since we're now optimizing chunks
      target: 'esnext', // Optimize for modern browsers
      cssCodeSplit: true, // Enable CSS code splitting
      sourcemap: false, // Disable sourcemaps for production (optional)
      minify: 'terser', // Minify using Terser for better compression
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Remove console logs
          drop_debugger: mode === 'production', // Remove debugger statements
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor libraries into their own chunks
            'vendor-react': ['react', 'react-dom', 'react-router'],
            'vendor-chakra': ['@chakra-ui/react', '@chakra-ui/cli'],
            'vendor-state': ['zustand', '@reduxjs/toolkit', 'react-redux'],
            'vendor-animation': ['framer-motion', 'canvas-confetti'],
            'vendor-utils': ['axios', 'rxjs', 'moment', 'uuid', 'dexie', 'react-icons', 'react-hook-form', 'next-themes'],
          },
          // Optimize chunk file names
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
        // Single rule for all workspace backend traffic.
        // root_path="/backend" in FastAPI ensures ALL Swagger-generated URLs use /backend/...
        //   /backend/docs          → /docs           (Swagger UI)
        //   /backend/openapi.json  → /openapi.json   (Swagger schema)
        //   /backend/v1/getuser    → /v1/getuser     (API calls)
        '/backend': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, '')
        },
        '/ui-api': {
          target: env.VITE_UI_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ui-api/, '')
        },
        '/identity': {
          target: env.VITE_IDENTITY_PROVIDER_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/identity/, '')
        }
      }
    }
  };
});

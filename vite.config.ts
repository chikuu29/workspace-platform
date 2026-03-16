import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import createVersionPlugin from './plugin/vite-plugin-version/index'; // Adjust the path as needed
// import tsconfigPaths from 'vite-tsconfig-paths'
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
      // tsconfigPaths()
    ],
    build: {
      chunkSizeWarningLimit: 1500,
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
      // rollupOptions: {
      //   output: {
      //     manualChunks(id) {
      //       if (id.includes('node_modules')) {
      //         if (id.includes('react') || id.includes('react-dom') || id.includes('@chakra-ui')) {
      //           return 'react-vendor';
      //         }
      //         return 'vendor';
      //       }
      //     }
      //   }

      // }
    },
    server: {
      port: 5174,
      hmr: { overlay: true },
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        '/ui-api': {
          target: env.VITE_UI_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ui-api/, '')
        },
        '/ai-api': {
          target: env.VITE_AI_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ai-api/, '')
        }
      }
    }
  };
});

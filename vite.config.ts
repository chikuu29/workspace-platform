import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer';

// import createVersionPlugin from './plugin/vite-plugin-version'
import createVersionPlugin from './plugin/vite-plugin-version/index'; // Adjust the path as needed

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log("%c" + `===THIS A ${mode.toUpperCase()} MODE ===`, "color:green");
  console.log("===CONNECT TO === " + env.VITE_API_URL);

  return {
    plugins: [
      react(),
      visualizer({
        filename: './dist/stats.html',
        open: true
      }), // Opens the visualizer report in your browser after build
      createVersionPlugin()
    ],
    // build: {
    //   // chunkSizeWarningLimit: 8000
    //   rollupOptions: {
    //     output: {
    //       manualChunks(id) {
    //         if (id.includes('node_modules')) {
    //           if (id.includes('react')) {
    //             return 'react-vender'
    //           }
    //           return 'vender'
    //         }
    //       }

    //     }
    //   }

    // },
    build: {
      chunkSizeWarningLimit: 1500,
      target: 'esnext', // Optimize for modern browsers
      cssCodeSplit: true, // Enable CSS code splitting
      sourcemap: false, // Disable sourcemaps for production (optional)
      // rollupOptions: {
      //   output: {
      //     // Manual chunking for vendor splitting
      //     manualChunks(id) {
      //       if (id.includes('node_modules')) {
      //         if (id.includes('react')) {
      //           return 'react-vendor'; // Separate React and ReactDOM
      //         }
      //         return 'vendor'; // Split third-party libraries
      //       }
      //     },
      //   },
      // },
      minify: 'terser', // Minify using Terser for better compression
      terserOptions: {
        compress: {
          drop_console: mode === 'production', // Remove console logs
          drop_debugger: mode === 'production', // Remove debugger statements
        },
      },
    },
    server: {
      hmr: { overlay: true },
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
    }

  };
})



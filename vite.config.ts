import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const DEBUG = process.env.VITE_DEBUG === 'true';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [],
        babelrc: false,
        configFile: false
      }
    })
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    cors: true,
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      timeout: 5000,
      overlay: true
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: DEBUG ? false : 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['@react-google-maps/api', '@googlemaps/markerclusterer'],
          'supabase-vendor': ['@supabase/supabase-js']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      '@react-google-maps/api',
      '@googlemaps/markerclusterer'
    ]
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase'
    }
  },
  logLevel: DEBUG ? 'info' : 'error',
  clearScreen: false,
  envPrefix: 'VITE_'
});
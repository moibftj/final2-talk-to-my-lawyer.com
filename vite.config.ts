import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2015',
        minify: 'terser',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks(id) {
              // Vendor chunks for large third-party libraries
              if (id.includes('node_modules')) {
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react';
                }
                if (id.includes('@google/genai')) {
                  return 'vendor-ai';
                }
                if (id.includes('@supabase/supabase-js')) {
                  return 'vendor-supabase';
                }
                if (id.includes('jspdf')) {
                  return 'vendor-pdf';
                }
                if (id.includes('framer-motion') || id.includes('clsx') || id.includes('tailwind-merge')) {
                  return 'vendor-ui';
                }
                return 'vendor-misc';
              }
              
              // Component chunks by feature/role (only if they exist and are large)
              if (id.includes('/components/Dashboard') || id.includes('/components/LetterRequestForm')) {
                return 'components-dashboard';
              }
              if (id.includes('/components/DatabasePlan')) {
                return 'components-admin';
              }
              if (id.includes('/components/ProjectRoadmap')) {
                return 'components-employee';
              }
              if (id.includes('/components/magicui/')) {
                return 'components-ui';
              }
            }
          }
        },
        // Increase chunk size warning limit to 1000kb to avoid warnings for our optimized chunks
        chunkSizeWarningLimit: 1000
      }
    };
});

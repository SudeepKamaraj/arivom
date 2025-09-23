import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Output directory for build files
    outDir: 'dist',
    
    // Generate source maps for debugging
    sourcemap: true,
    
    // Minify the output
    minify: 'esbuild',
    
    // Target browsers
    target: 'esnext',
    
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
        // Asset file names
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    
    // Chunk size warning limit (in kB)
    chunkSizeWarningLimit: 1000,
    
    // Build for production
    emptyOutDir: true,
  },
});

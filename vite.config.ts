import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/sql.js/dist/sql-wasm.wasm',
          dest: 'sqljs'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      util: path.resolve(__dirname, './src/util'),
      settings: path.resolve(__dirname, './src/settings.js'),
      assets: path.resolve(__dirname, './src/assets'),
      content: path.resolve(__dirname, './src/features/content'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      maxParallelFileOps: 20,
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material'],
          sql: ['sql.js'],
          editor: ['@codemirror/lang-sql', '@uiw/react-codemirror'],
          zustand: ['zustand'],
        },
      },
    },
  },
});





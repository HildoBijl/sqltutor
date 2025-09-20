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
        },
        {
          src: 'content',
          dest: ''
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
      routing: path.resolve(__dirname, './src/routing'),
      assets: path.resolve(__dirname, './src/assets'),
      pages: path.resolve(__dirname, './src/pages'),
      edu: path.resolve(__dirname, './src/edu'),
      content: path.resolve(__dirname, './src/features/content'),
      eduComponents: path.resolve(__dirname, './src/eduComponents'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          sql: ['sql.js'],
          editor: ['@codemirror/lang-sql', '@uiw/react-codemirror'],
          zustand: ['zustand'],
        },
      },
    },
  },
});





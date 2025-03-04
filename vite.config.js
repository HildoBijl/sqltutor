import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: '/src',
      assets: '/src/assets',
      components: '/src/components',
      pages: '/src/pages',
      routing: '/src/routing',
      settings: '/src/settings',
      util: '/src/util',
    },
  },
})

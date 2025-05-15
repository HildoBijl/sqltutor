import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: './node_modules/sql.js/dist/sql-wasm.wasm',
          dest: 'sqljs'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      src: '/src',
      assets: '/src/assets',
      components: '/src/components',
      content: '/src/content',
      edu: '/src/edu',
      eduComponents: '/src/eduComponents',
      pages: '/src/pages',
      routing: '/src/routing',
      settings: '/src/settings',
      util: '/src/util',
    },
  },
})

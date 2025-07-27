import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

const SRC_DIR = path.resolve(__dirname, './src')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': SRC_DIR,
      '@components': path.resolve(SRC_DIR, 'components'),
      '@constants': path.resolve(SRC_DIR, 'constants'),
      '@contexts': path.resolve(SRC_DIR, 'contexts'),
      '@layout': path.resolve(SRC_DIR, 'layout'),
      '@lib': path.resolve(SRC_DIR, 'lib'),
      '@mocks': path.resolve(SRC_DIR, 'mocks'),
      '@pages': path.resolve(SRC_DIR, 'pages'),
      '@services': path.resolve(SRC_DIR, 'services'),
      '@types': path.resolve(SRC_DIR, 'types'),
      '@utils': path.resolve(SRC_DIR, 'utils'),
      '@assets': path.resolve(SRC_DIR, 'assets'),
    },
  },
})

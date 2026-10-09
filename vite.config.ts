import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { leadDevApi } from './server/devApi.ts'

// https://vite.dev/config/
export default defineConfig({
  // leadDevApi: serves POST /api/lead in `npm run dev` (mock email delivery by default).
  plugins: [react(), tailwindcss(), leadDevApi()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server/**/*.test.ts'],
  },
})

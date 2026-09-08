import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // No base needed for Vercel (served at root)
  plugins: [react()],
});

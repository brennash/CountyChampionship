import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Base path matches the GitHub Pages project URL: <user>.github.io/CountyChampionship/
export default defineConfig({
  base: '/CountyChampionship/',
  plugins: [react()],
})

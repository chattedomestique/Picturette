import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // In dev, serve from root so localhost:5173/ works.
  // In build, set the GitHub Pages sub-path.
  base: command === 'build' ? '/Picturette/' : '/',
}))

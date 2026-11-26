/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite: servidor de desarrollo (npm run dev) y empaquetador (npm run build).
// El bloque "test" configura Vitest, el equivalente de Jasmine/Karma en Angular o xUnit en .NET.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true }, // 5173 ya está permitido en el CORS de la API .NET
  test: {
    environment: 'jsdom',          // DOM simulado: las pruebas corren sin navegador
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // Node.js built-in for working with file paths

// defineConfig wraps your config object — gives you TypeScript
// type checking and intellisense on all Vite config options
export default defineConfig({

  // Plugins extend Vite's core functionality
  plugins: [
    react(),        // enables JSX/TSX support + React Fast Refresh (hot reload)
    tailwindcss(),  // integrates Tailwind into Vite's build pipeline
  ],

  resolve: {
    alias: {
      // Maps '@' to your src/ folder so you can write:
      // import X from '@/components/X'  instead of  '../../../components/X'
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173, // run the dev server on this port (http://localhost:5173)

    proxy: {
      // Any request starting with /api gets intercepted here
      '/api': {
        target: 'http://localhost:8080', // forward it to your Spring Boot backend
        changeOrigin: true,              // rewrites the Host header to match the target
                                         // prevents Spring Boot from rejecting the request
        // Result: fetch('/api/users') in React
        //      → Vite forwards to http://localhost:8080/api/users
        //      → no CORS error since browser only sees localhost:5173
      },
    },
  },
})
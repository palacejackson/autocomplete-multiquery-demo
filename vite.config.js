import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: 3000,
    allowedHosts: ['c3sds2-3000.csb.app']
  }
})
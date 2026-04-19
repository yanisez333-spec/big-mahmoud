import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:       resolve(__dirname, 'index.html'),
        reservation:resolve(__dirname, 'reservation.html'),
        admin:      resolve(__dirname, 'admin.html'),
        menu:       resolve(__dirname, 'menu.html'),
        contact:    resolve(__dirname, 'contact.html'),
        evenements: resolve(__dirname, 'evenements.html'),
        faq:        resolve(__dirname, 'faq.html'),
        galerie:    resolve(__dirname, 'galerie.html'),
        visite3d:   resolve(__dirname, 'visite3d.html'),
      }
    }
  }
})

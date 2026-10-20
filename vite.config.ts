import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages hosts this repository under /SCL-site-portal/.
// This makes Vite rewrite JS, CSS, and imported asset URLs for that path.
export default defineConfig({
  base: '/SCL-site-portal/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
  },
});

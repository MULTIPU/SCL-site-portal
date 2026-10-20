import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages project-site path. Keep this aligned with the repository name.
export default defineConfig({
  base: '/SCL-site-portal/',
  plugins: [react()],
  server: { host: '0.0.0.0', port: 3000, allowedHosts: true },
  preview: { host: '0.0.0.0' },
});

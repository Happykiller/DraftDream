// vite.config.ts
import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      selfDestroying: true,
      manifest: {
        name: 'FitDesk Backoffice',
        short_name: 'FitDesk BO',
        description: 'Outil de coaching FitDesk (backoffice)',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        id: '/',
        icons: [
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
});

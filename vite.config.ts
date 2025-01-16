import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/chat',
  build: {
    assetsDir: 'assets_0.0.47',
  },
  plugins: [
    svgr(),
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 3_000_000,
      },
      manifest: {
        name: 'GREEN-API Console Chat',
        short_name: 'GREEN-API Chat',
        scope: '/chat/',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#3B9702',
        description:
          'GREEN-API: WhatsApp API on any language PHP, JavaScript, 1C, Python, Java, C#, VBA etc.',
      },
    }),
  ],
});

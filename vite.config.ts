import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/chat',
  build: {
    assetsDir: 'assets_0.0.19',
  },
  plugins: [svgr(), react(), tsconfigPaths()],
});

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const assetsDirectory = 'assets_0.0.67';
const hash = Math.floor(Math.random() * 90_000) + 10_000;

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    assetsDir: assetsDirectory,
    rollupOptions: {
      output: {
        entryFileNames: `${assetsDirectory}/[name].${hash}.js`,
        chunkFileNames: `${assetsDirectory}/[name].${hash}.js`,
        assetFileNames: `${assetsDirectory}/[name].${hash}.[ext]`,
      },
    },
  },
  plugins: [svgr(), react(), tsconfigPaths()],
});

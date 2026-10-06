import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const assetsDirectory = 'assets_1.0.4';

// Do not force-split React/Antd/rc ecosystem to avoid runtime init cycles.
const UNSPLIT_PACKAGES = [
  /^react$/,
  /^react-dom$/,
  /^scheduler$/,
  /^react-router(-dom)?$/,
  /^@remix-run\/router$/,
  /^antd$/,
  /^@ant-design\//,
  /^@rc-component\//,
  /^rc-/,
];

const MANUAL_CHUNKS: Record<string, RegExp[]> = {
  redux: [
    /^@reduxjs\/toolkit$/,
    /^react-redux$/,
    /^redux(-persist|-thunk)?$/,
    /^reselect$/,
    /^immer$/,
    /^use-sync-external-store$/,
  ],
  phone: [/^libphonenumber-js$/],
};

const getPackageName = (id: string): string | undefined => {
  const normalized = id.replaceAll('\\', '/');
  const marker = 'node_modules/';
  const index = normalized.lastIndexOf(marker);

  if (index === -1) {
    return undefined;
  }

  const [scopeOrName, name] = normalized.slice(index + marker.length).split('/');

  return scopeOrName.startsWith('@') ? `${scopeOrName}/${name}` : scopeOrName;
};

const getSafeManualChunk = (id: string): string | undefined => {
  const package_ = getPackageName(id);

  if (!package_ || UNSPLIT_PACKAGES.some((re) => re.test(package_))) {
    return undefined;
  }

  return Object.entries(MANUAL_CHUNKS).find(([, patterns]) =>
    patterns.some((re) => re.test(package_))
  )?.[0];
};

export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  server: {
    host: true,
    port: 5174,
    // https: true,
  },
  build: {
    assetsDir: assetsDirectory,
    rollupOptions: {
      output: {
        entryFileNames: `${assetsDirectory}/[name].[hash].js`,
        chunkFileNames: `${assetsDirectory}/[name].[hash].js`,
        assetFileNames: `${assetsDirectory}/[name].[hash].[ext]`,
        manualChunks: getSafeManualChunk,
      },
    },
  },
  plugins: [
    svgr(),
    react(),
    tsconfigPaths(),
    viteCompression({
      verbose: true, // Output compression results
      disable: false, // Enable compression
      algorithm: 'gzip', // Use gzip compression
      ext: '.gz', // The extension of the compressed file
      threshold: 10_240, // Only compress files larger than 10kb
      deleteOriginFile: false, // Do not delete the original files
    }),
  ],
});

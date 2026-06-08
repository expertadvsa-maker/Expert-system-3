import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: '/',
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api_public': {
          target: 'https://aliphia.com/v1',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.startsWith('/api_public/guest/') 
            ? path.replace(/^\/api_public/, '') 
            : path,
          configure: (proxy, options) => {
            proxy.on('proxyRes', (proxyRes, req, res) => {
              delete proxyRes.headers['www-authenticate'];
              if (req.url && req.url.includes('/guest/')) {
                delete proxyRes.headers['content-disposition'];
                proxyRes.headers['content-disposition'] = 'inline';
              }
            });
          }
        }
      }
    },
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      chunkSizeWarningLimit: 10000,
      rollupOptions: {
        maxParallelFileOps: 1,
        output: {
          manualChunks: undefined
        }
      }
    },
  };
});

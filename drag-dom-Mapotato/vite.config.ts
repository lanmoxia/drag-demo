import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  root: './',
  resolve: {
    alias: [
      { find: '@', replacement: resolve(__dirname, 'src') },
      { find: '@common', replacement: resolve(__dirname, 'src/common') },
      { find: '@assets', replacement: resolve(__dirname, 'src/assets') },
    ],
  },
  plugins: [
    vue(),
    AutoImport({ resolvers: [AntDesignVueResolver()] }),
    Components({ resolvers: [AntDesignVueResolver()] }),
  ],
  server: {},
  esbuild: {
    drop: ['debugger'],
  },
});

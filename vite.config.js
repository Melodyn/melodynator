import { resolve } from 'path';

export default {
  root: resolve(__dirname, 'src'),
  base: '/melodynator/',
  build: {
    outDir: '../dist',
  },
  server: {
    port: 8080
  },
  // Optional: Silence Sass deprecation warnings. See note below.
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: [
          'import',
          'mixed-decls',
          'color-functions',
          'global-builtin',
        ],
      },
    },
  },
  test: {
    include: ['../__tests__/**/*.test.ts'],
  }
};

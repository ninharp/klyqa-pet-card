import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'klyqa-pet-card.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    target: 'es2021',
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});

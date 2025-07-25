import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  minify: false,
  treeshake: false,
  noExternal: ['@learnlab/datashop-logger'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    }
  }
});
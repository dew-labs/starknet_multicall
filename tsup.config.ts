import {defineConfig} from 'tsup'

export default defineConfig(options => ({
  entry: ['src/**/*.ts', '!**/*.d.ts', '!src/scripts/**/*'],
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  minify: !options.watch,
  dts: true,
  metafile: true,
  format: ['esm', 'cjs'],
  // shims: true,
}))

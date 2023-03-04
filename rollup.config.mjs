import bundleSize from 'rollup-plugin-bundle-size'
import { defineConfig } from 'rollup'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default defineConfig({
  input: 'src/index.ts',
  output: [
    { format: 'cjs', file: 'dist/index.js' },
    { format: 'es', file: 'dist/index.mjs' },
  ],
  plugins: [
    typescript({ exclude: ['**/example.ts'] }),
    terser(),
    bundleSize(),
  ],
})

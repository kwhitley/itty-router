import bundleSize from 'rollup-plugin-bundle-size'
import { defineConfig } from 'rollup'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'

export default defineConfig({
  input: 'src/itty-router.ts',
  output: [
    { format: 'cjs', file: 'dist/itty-router.js' },
    { format: 'es', file: 'dist/itty-router.mjs' },
  ],
  plugins: [
    typescript({ exclude: ['**/example.ts'] }),
    terser(),
    bundleSize(),
  ],
})

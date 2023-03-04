import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { defineConfig } from 'rollup'
import bundleSize from 'rollup-plugin-bundle-size'

export default defineConfig({
  input: [
    'src/extras/index.ts'
  ],
  output: [
    {
      format: 'cjs',
      dir: 'dist/extras',
      preserveModules: true,
    },
    {
      format: 'es',
      dir: 'dist/extras',
      preserveModules: true,
    },
  ],
  // output: [
  //   {
  //     format: 'cjs',
  //     file: 'dist/extras/index.js',
  //     preserveModules: true,
  //   },
  //   {
  //     format: 'es',
  //     file: 'dist/extras/index.mjs',
  //     preserveModules: true,
  //   },
  // ],
  plugins: [
    typescript({ exclude: ['**/example.ts'] }),
    terser(),
    // bundleSize(),
  ],
})

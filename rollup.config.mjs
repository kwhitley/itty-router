import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import bundleSize from 'rollup-plugin-bundle-size'

export default async () => ({
    input: './src/index.ts',
    output: [
      {
        format: 'cjs',
        file: './dist/index.js',
        sourcemap: true,
       },
      {
        format: 'esm',
        file: './dist/index.mjs',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript(),
      terser(),
      bundleSize(),
    ],
  })

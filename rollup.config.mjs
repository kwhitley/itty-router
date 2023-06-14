import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { globby } from 'globby'
import bundleSize from 'rollup-plugin-bundle-size'

export default async () => {
  const files = await globby('./src/*.ts', {
    ignore: ['**/*.spec.ts', 'example'],
  })

  console.log({ files })

  return files.map((path) => ({
    input: path,
    output: [
      {
        format: 'esm',
        file: path.replace('/src/', '/dist/').replace('.ts', '.js'),
        // sourcemap: true,
      },
      {
        format: 'cjs',
        file: path.replace('/src/', '/dist/').replace('.ts', '.cjs.js'),
        // sourcemap: true,
      },
    ],
    plugins: [
      typescript({ sourceMap: false }),
      terser(),
      bundleSize(),
    ],
  }))
}

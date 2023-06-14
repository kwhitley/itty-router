import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import { globby } from 'globby'
import bundleSize from 'rollup-plugin-bundle-size'
import copy from 'rollup-plugin-copy'

export default async () => {
  const files = (await globby('./src/*.ts', {
    ignore: ['**/*.spec.ts', 'example'],
  })).map(path => ({
    path,
    shortPath: path.replace(/(\/src)|(\.ts)/g, '').replace('./index', '.'),
    esm: path.replace('/src/', '/dist/').replace('.ts', '.js'),
    cjs: path.replace('/src/', '/dist/').replace('.ts', '.cjs.js'),
    types: path.replace('/src/', '/dist/').replace('.ts', '.d.ts'),
  }))

  console.log(files.map(f => f.path))

  return files.map(file => ({
    input: file.path,
    output: [
      {
        format: 'esm',
        file: file.esm,
        sourcemap: false,
      },
      {
        format: 'cjs',
        file: file.cjs,
        sourcemap: false,
      },
    ],
    plugins: [
      typescript({ sourceMap: true }),
      terser(),
      bundleSize(),
      copy({
        targets: [
          {
            src: ['LICENSE'],
            dest: 'dist',
          },
        ],
      }),
    ],
  }))
}

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

  // const exportInjection = files.map(({ shortPath, esm, cjs, types }) => `
  //   "${shortPath}": {
  //     "import": "${esm}",
  //     "require": "${cjs}",
  //     "types": "${types}",
  //   }`).join(',\n')

  return files.map(file => ({
    input: file.path,
    output: [
      {
        format: 'esm',
        file: file.esm,
        // sourcemap: true,
      },
      {
        format: 'cjs',
        file: file.cjs,
        // sourcemap: true,
      },
    ],
    plugins: [
      typescript({ sourceMap: false }),
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

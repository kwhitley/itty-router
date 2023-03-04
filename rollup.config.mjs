import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import bundleSize from 'rollup-plugin-bundle-size'
import { globby } from 'globby'

export default async () => {
  const files = await globby('src/**/*.ts', {
    ignore: [
      'src/**/*.spec.ts',
      'src/example.ts',
    ]
  })

  console.log({ files })

  return files.map(path => ({
    input: path,
    output: [
      { format: 'cjs', file: path.replace(/src/g, 'dist').replace(/\.ts$/, '.cjs') },
      { format: 'esm', file: path.replace(/src/g, 'dist').replace(/\.ts$/, '.mjs') },
    ],
    plugins: [
      // multi(),
      typescript(),
      terser(),
      bundleSize(),
    ],
  }))

  return [
    {
      input: ['src/index.ts'],
      output: [
        { format: 'cjs', file: 'dist/index.cjs' },
        { format: 'esm', file: 'dist/index.mjs' },
      ],
      plugins: [
        // multi(),
        typescript({ exclude: ['**/example.ts'] }),
        terser(),
        bundleSize(),
      ],
    }
  ]
}

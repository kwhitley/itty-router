const { readFileSync, writeFileSync, moveSync } = require('fs-extra')

moveSync('./dist/itty-router.js', './dist/itty-router.mjs')

const base = readFileSync('./dist/itty-router.mjs', { encoding: 'utf-8' })
const cjs = base
              .replace('export function Router', 'function Router')
              .replace('export default ', 'module.exports = ')
              .replace(/\s*\/\/[^\n]+/g, '')

writeFileSync('./dist/itty-router.js', cjs)
console.log('writing cjs version.')

const test = readFileSync('./src/itty-router.spec.js', { encoding: 'utf-8' })
const minifiedTest = test.replace('itty-router', 'itty-router.min.js')
writeFileSync('./dist/itty-router.spec.js', minifiedTest)
console.log('creating dist tests --> dist/itty-router.spec.js')

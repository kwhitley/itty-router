const { readFileSync, writeFileSync } = require('fs-extra')

console.log('writing esm version.')
const base = readFileSync('./src/itty-router.js', { encoding: 'utf-8' })
const esm = base
              .replace('function Router', 'export function Router')
              .replace('module.exports =', 'export default')
              .replace(/\s*\/\/[^\n]+/g, '')
writeFileSync('./dist/itty-router.mjs', esm)

const test = readFileSync('./src/itty-router.spec.js', { encoding: 'utf-8' })
const minifiedTest = test.replace('itty-router', 'itty-router.min.js')
writeFileSync('./dist/itty-router.spec.js', minifiedTest)
console.log('creating dist tests --> dist/itty-router.spec.js')

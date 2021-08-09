const { readFileSync, writeFileSync } = require('fs-extra')

const base = readFileSync('./src/itty-router.js', { encoding: 'utf-8' })
const minifiedBase = base
  .replace(/^\s*\/\/.*\n/mg, '') // remove comments
  .replace(/\bargs\b/g, 'a') // Args
  .replace(/\bhandlers\b/g, 'H') // (H)andlers
  // .replace(/\broutes([^:])/g, 'r$1') // Routes
  .replace(/([^\.])handler\b/g, '$1h') // Handler
  .replace(/([^\.])match\b/g, '$1m') // Match
  .replace(/([^\.])method\b/g, '$1M') // (M)ethod
  .replace(/([^\.])prop\b/g, '$1k') // Key
  .replace(/([^\.])receiver\b/g, '$1c') // Options
  .replace(/([^\.])request\b/g, '$1q') // reQuest
  .replace(/([^\.])response\b/g, '$1s') // reSponse
  .replace(/([^\.])route\b/g, '$1p') // Path
  .replace(/([^\.])target\b/g, '$1t') // Target
  .replace(/([^\.])url\b/g, '$1u') // Url
writeFileSync('./dist/itty-router.js', minifiedBase)
console.log('minifying variables --> dist/itty-router.js')

const test = readFileSync('./src/itty-router.spec.js', { encoding: 'utf-8' })
const minifiedTest = test.replace('itty-router.js', 'itty-router.min.js')
writeFileSync('./dist/itty-router.spec.js', minifiedTest)
console.log('creating dist tests --> dist/itty-router.spec.js')

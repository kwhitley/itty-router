const { readFileSync, writeFileSync } = require('fs-extra')

const base = readFileSync('./src/itty-router.js', { encoding: 'utf-8' })
const minified = base.replace(/\bhandler\b/g, 'h')
  .replace(/([^\.])obj\b/g, '$1o')
  .replace(/([^\.])path\b/g, '$1p')
  .replace(/([^\.])route\b/g, '$1r')
  .replace(/([^\.])request\b/g, '$1c')
  .replace(/([^\.])match\b/g, '$1m')
  .replace(/([^\.])prop\b/g, '$1k')
  .replace(/([^\.])url\b/g, '$1u')
  
writeFileSync('./dist/itty-router.js', minified)
console.log('minifying variables --> dist/itty-router.js')

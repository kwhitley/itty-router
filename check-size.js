const { readFileSync } = require('fs-extra')
const gzipSize = require('gzip-size')

const base = readFileSync('./dist/itty-router.js', { encoding: 'utf-8' })

console.log('gzipped size:', gzipSize.sync(base), 'bytes')

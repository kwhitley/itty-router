const { readFileSync } = require('fs-extra')
const { magenta } = require('chalk')
const gzipSize = require('gzip-size')

const base = readFileSync('./dist/itty-router.min.js', { encoding: 'utf-8' })

console.log(magenta('gzipped size:'), gzipSize.sync(base), 'bytes')
const { readdirSync } = require('fs')
const { resolve, basename } = require('path')

function getChildren(target, basePath = '/api/') {
  return readdirSync(resolve(__dirname, '../docs/api'))
    .map(file => basename(file, '.md'))
    .filter(file => file.includes(target))
    .map(file => `${basePath}${file}`)
}

module.exports = {
  getChildren
}

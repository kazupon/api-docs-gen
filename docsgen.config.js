const { tocResolver, tocProcessor } = require('./lib/index')

module.exports = {
  linkReferencer: tocResolver,
  processor: tocProcessor
}

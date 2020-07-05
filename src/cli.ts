import meow from 'meow'
import { generate } from './generator'

export const flags = {
  output: {
    type: 'string',
    alias: 'o',
    isRequired: false
  },
  config: {
    type: 'string',
    alias: 'c',
    isRequired: false
  }
} as const

const cli = meow(
  `
  Usage
    $ doc-api-gen <input>

  Options
    --config, -c configuration file
    --output, -o output of API docs markdown contents

  Examples
    $ doc-api-gen my-library-api.json
    $ doc-api-gen my-library-api.json --output ./docs
    $ doc-api-gen my-library-api.json --config api-doc-gen.js
`,
  {
    flags
  }
)

generate(cli)

process.on('uncaughtException', err => {
  console.error(`uncaught exception: ${err}\n`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  console.error('unhandled rejection at:', p, 'reason:', reason)
  process.exit(1)
})

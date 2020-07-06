import meow from 'meow'
import chalk from 'chalk'
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
    $ api-docs-gen <input>

  Options
    --config, -c configuration file
    --output, -o output dierectory that is markdown contents

  Examples
    $ api-docs-gen my-library-api.json
    $ api-docs-gen my-library-api.json --output ./docs
    $ api-docs-gen my-library-api.json --config docsgen.config.js
`,
  {
    flags
  }
)

// run
generate(cli)

process.on('uncaughtException', err => {
  console.error(chalk.red(`[api-docs-gen] Uncaught exception: ${err}\n`))
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  console.error(
    chalk.red(`[api-docs-gen] Unhandled rejection at: ${p}, reason: ${reason}`)
  )
  process.exit(1)
})

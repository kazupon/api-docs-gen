import path from 'path'
import meow from 'meow'
import chalk from 'chalk'
import { debug as Debug } from 'debug'
import { generate } from './generator'

const debug = Debug('api-docs-gen:cli')

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

// check input
const input = cli.input
if (!input.length) {
  console.error(chalk.red(`[api-docs-gen] not specified docs model`))
  process.exit(1)
}

// resolve output
const output =
  cli.flags.output != null ? path.resolve(cli.flags.output) : process.cwd()
debug(`output`, output)

// config
const config = cli.flags.config
debug(`config`, config)

// run
try {
  ;(async () => {
    await generate(input, output, config)
  })()
} catch (e) {
  console.error(chalk.red(`[api-docs-gen] ${e.message}`))
  process.exit(1)
}

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

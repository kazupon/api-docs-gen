import path from 'path'
import fs from 'fs'
import meow from 'meow'
import chalk from 'chalk'
import { debug as Debug } from 'debug'
import { generate } from './generator'
import { Config, resolveConfig, DefaultConfig, GenerateStyle } from './config'

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
  },
  'generate-style': {
    type: 'string',
    alias: 'g',
    default: GenerateStyle.Prefix
  }
} as const

const cli = meow(
  `
  Usage
    $ api-docs-gen <input>

  Options
    --config, -c              configuration file
    --output, -o              output dierectory that is markdown contents
    --generate-style, -g      document generating style, default 'prefix'
                              Be able to separated each package docs with 'directory'

  Examples
    $ api-docs-gen package1.api.json
    $ api-docs-gen package1.api.json --output ./docs
    $ api-docs-gen package1.api.json --config docsgen.config.js
    $ api-docs-gen package1.api.json package2.api.json --generate-style directory
`,
  {
    flags
  }
)
debug('cli', cli)

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

// mkdir directory, if not exist
try {
  fs.mkdirSync(output, { recursive: true })
} catch (e) {
  console.error(
    chalk.red(`[api-docs-gen] make output directory error: ${e.message}`)
  )
  process.exit(1)
}

// config
let config: Config = DefaultConfig
try {
  config = resolveConfig(cli.flags.config)
} catch (e) {
  console.error(chalk.red(`[api-docs-gen] ${e.message}`))
  process.exit(1)
}
debug(`config`, config)

// generate style
const genStyleFlag = cli.flags['generate-style'] as GenerateStyle
const genStyle = Object.keys([
  GenerateStyle.Prefix,
  GenerateStyle.Directory
]).includes(genStyleFlag)
  ? genStyleFlag
  : GenerateStyle.Prefix
debug('packageDocsStyle', genStyleFlag, genStyle)

// run
try {
  ;(async () => {
    await generate(
      input,
      output,
      genStyle,
      config,
      (pkgname: string, filepath: string) => {
        console.log(chalk.green(`📦 ${pkgname}: 📝 save ${filepath}`))
      }
    )
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

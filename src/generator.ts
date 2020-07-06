import meow from 'meow'
import path from 'path'
import { promises as fs, constants as fsConstants } from 'fs'
import chalk from 'chalk'
import { ApiPackage, ApiModel } from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { flags } from './cli'
import { resolve as resolver } from './resolver'
import { process as processor } from './processor'
import { transform } from './transformer'
import type { Config } from './config'
import { isString } from './utils'

const debug = Debug('api-docs-gen:generator')

export async function generate(cli: meow.Result<typeof flags>): Promise<void> {
  debug('cli', cli)

  if (!cli.input[0]) {
    console.error(chalk.red(`[api-docs-gen] not specified model`))
    process.exit(1)
  }
  const modelPath = cli.input[0]
  debug(`model`, modelPath)

  const output = resolveOutput(cli.flags.output)
  debug(`output`, output)

  const config = await resolveConfig(cli.flags.config)
  debug(`config`, config)

  const apiModel = new ApiModel()
  const apiPackage = loadPackage(modelPath, apiModel)
  const model = transform(apiPackage, apiModel, config.resolver!)

  const result = config.processor(model)
  if (isString(result)) {
    debug('result(string):', result)
    await fs.writeFile(path.resolve(output, 'index.md'), result, 'utf-8')
  } else if (Array.isArray(result)) {
    for (const { filename, body } of result) {
      await fs.writeFile(path.resolve(output, filename), body, 'utf-8')
    }
  } else {
    console.error(
      chalk.red(`[api-docs-gen] Not supported processor result type`)
    )
    process.exit(1)
  }
}

function resolveOutput(output?: string): string {
  return output != null ? path.resolve(output) : process.cwd()
}

async function resolveConfig(configPath?: string): Promise<Config> {
  const cwd = process.cwd()
  let config: Config | undefined
  let resolvedPath: string | undefined
  const defaultConfig = {
    resolver,
    processor
  }

  if (configPath) {
    resolvedPath = path.resolve(cwd, configPath)
  } else {
    const configPath = path.resolve(cwd, 'docsgen.config.js')
    try {
      await fs.access(configPath, fsConstants.F_OK)
      resolvedPath = configPath
    } catch (e) {}
  }

  if (!resolvedPath) {
    return defaultConfig
  }

  try {
    try {
      config = require(resolvedPath)
    } catch (e) {
      if (
        !/Cannot use import statement|Unexpected token 'export'/.test(e.message)
      ) {
        throw e
      }
    }

    if (config) {
      config.resolver = config.resolver || resolver
      return config
    } else {
      return defaultConfig
    }
  } catch (e) {
    console.error(
      chalk.red(`[api-docs-gen] failed to load config from ${resolvedPath}:`)
    )
    console.error(e)
    process.exit(1)
  }
}

function loadPackage(modelPath: string, model: ApiModel): ApiPackage {
  try {
    return model.loadPackage(modelPath)
  } catch (e) {
    console.error(
      chalk.red(`[api-docs-gen] cannot load package model from ${modelPath}:`)
    )
    console.error(e)
    process.exit(1)
  }
}

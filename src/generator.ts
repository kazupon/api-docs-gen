import meow from 'meow'
import { flags } from './cli'
import path from 'path'
import fs from 'fs'
import chalk from 'chalk'
import { debug as Debug } from 'debug'
import { resolve as resolver } from './resolver'
import { process as processor } from './processor'
import { transform } from './transformer'
import type { Config } from './config'
import { ApiPackage, ApiModel } from '@microsoft/api-extractor-model'
import { isString } from './utils'

const debug = Debug('api-docs-gen:generator')

export async function generate(cli: meow.Result<typeof flags>) {
  debug('cli', cli)

  if (!cli.input[0]) {
    console.error(chalk.red(`[api-docs-gen] not specified model`))
    process.exit(1)
  }
  const modelPath = cli.input[0]
  debug(`model`, modelPath)

  const output = resolveOutput(cli.flags.output)
  debug(`output`, output)

  const config = resolveConfig(cli.flags.config)
  debug(`config`, config)

  const apiModel = new ApiModel()
  const apiPackage = loadPackage(modelPath, apiModel)
  const model = transform(apiPackage, apiModel, config.resolver!)

  const result = config.processor(model)
  if (isString(result)) {
    debug('result(string):', result)
    fs.writeFileSync(path.resolve(output, 'index.md'), result, 'utf-8')
  } else if (Array.isArray(result)) {
    for (const { filename, body } of result) {
      fs.writeFileSync(path.resolve(output, filename), body, 'utf-8')
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

function resolveConfig(configPath?: string): Config {
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
    const jsConfigPath = path.resolve(cwd, 'api-docs-gen.config.js')
    if (fs.existsSync(jsConfigPath)) {
      resolvedPath = jsConfigPath
    }
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

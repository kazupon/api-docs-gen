import path from 'path'
import { promises as fs, constants as fsConstants } from 'fs'
import chalk from 'chalk'
import { ApiPackage, ApiModel } from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { resolve } from './resolver'
import { process as mdProcessor } from './processor'
import { isString } from './utils'

import type { Config } from './types'

const debug = Debug('api-docs-gen:generator')

/**
 * generate markdown contents
 *
 * @param input input paths
 * @param output output path
 * @param config config path, if it's not spefified, use `process.cwd()` as default
 */
export async function generate(
  input: string[],
  output: string,
  config?: string
): Promise<void> {
  const resolvedConfig = await resolveConfig(config)
  debug(`resolvedConfig`, resolveConfig)

  for (const target of input) {
    debug(`generate from ${target} ...`)

    const apiModel = new ApiModel()
    const apiPackage = loadPackage(target, apiModel)

    const result = resolvedConfig.processor(
      apiModel,
      apiPackage,
      resolvedConfig.linkReferencer!
    )
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
}

async function resolveConfig(configPath?: string): Promise<Config> {
  const cwd = process.cwd()
  let config: Config | undefined
  let resolvedPath: string | undefined
  const defaultConfig: Config = {
    linkReferencer: resolve,
    processor: mdProcessor
  }

  if (configPath) {
    resolvedPath = path.resolve(cwd, configPath)
  } else {
    const configPath = path.resolve(cwd, 'docsgen.config.js')
    try {
      await fs.access(configPath, fsConstants.F_OK)
      resolvedPath = configPath
    } catch (e) {
      debug(`config access error: ${e.message}`)
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
      config.linkReferencer = config.linkReferencer || resolve
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

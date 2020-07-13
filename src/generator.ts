import path from 'path'
import { promises as fs, constants as fsConstants } from 'fs'
import { ApiPackage, ApiModel } from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { resolve } from './resolver'
import { process as markdownProcessor } from './processor'
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

    let result = resolvedConfig.processor(
      apiModel,
      apiPackage,
      resolvedConfig.linkReferencer! // eslint-disable-line @typescript-eslint/no-non-null-assertion
    )

    if (isString(result)) {
      result = [
        {
          filename: 'index.md',
          body: result
        }
      ]
    }

    if (!Array.isArray(result)) {
      throw new Error('Not supported processor result type')
    }

    for (const { filename, body } of result) {
      await fs.writeFile(path.resolve(output, filename), body, 'utf-8')
    }
  }
}

async function resolveConfig(configPath?: string): Promise<Config> {
  const cwd = process.cwd()
  let config: Config | undefined
  let resolvedPath: string | undefined
  const defaultConfig: Config = {
    linkReferencer: resolve,
    processor: markdownProcessor
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
    throw new Error(`Failed to load config from ${resolvedPath}: ${e.message}`)
  }
}

function loadPackage(modelPath: string, model: ApiModel): ApiPackage {
  try {
    return model.loadPackage(modelPath)
  } catch (e) {
    throw new Error(`Cannot load package model from ${modelPath}: ${e.message}`)
  }
}

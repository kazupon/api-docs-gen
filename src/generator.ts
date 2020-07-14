import path from 'path'
import { promises as fs } from 'fs'
import { ApiPackage, ApiModel } from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { isString } from './utils'

import type { Config } from './config'

const debug = Debug('api-docs-gen:generator')

/**
 * generate markdown contents
 *
 * @param input input paths
 * @param output output path
 * @param config configration, see {@link Config}
 */
export async function generate(
  input: string[],
  output: string,
  config: Config
): Promise<void> {
  debug(`Config`, config)

  for (const target of input) {
    debug(`generate from ${target} ...`)

    const apiModel = new ApiModel()
    const apiPackage = loadPackage(target, apiModel)
    console.log('pacakge', apiPackage.displayName)

    let result = config.processor(
      apiModel,
      apiPackage,
      config.linkReferencer! // eslint-disable-line @typescript-eslint/no-non-null-assertion
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

    const pkgDir = path.resolve(output, apiPackage.displayName)
    try {
      await fs.mkdir(pkgDir, { recursive: true })
    } catch (e) {
      throw new Error(`Cannot make '${pkgDir} directory: ${e.message}`)
    }

    for (const { filename, body } of result) {
      await fs.writeFile(path.resolve(pkgDir, filename), body, 'utf-8')
    }
  }
}

function loadPackage(modelPath: string, model: ApiModel): ApiPackage {
  try {
    return model.loadPackage(modelPath)
  } catch (e) {
    throw new Error(`Cannot load package model from ${modelPath}: ${e.message}`)
  }
}

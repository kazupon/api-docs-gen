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
  config: Config,
  callback?: (pkgname: string, filename: string) => void
): Promise<void> {
  debug(`Config`, config)

  const apiModel = new ApiModel()
  for (const target of input) {
    debug(`generate from ${target} ...`)
    const apiPackage = loadPackage(target, apiModel)

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
      const filepath = path.resolve(pkgDir, filename)
      await fs.writeFile(filepath, body, 'utf-8')
      callback && callback(apiPackage.displayName, filepath)
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

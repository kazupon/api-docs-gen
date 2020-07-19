import path from 'path'
import { ApiModel } from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { loadPackage } from './resolver'
import { isString, mkdir, writeFile } from './utils'

import type { Config, GenerateStyle } from './config'

const debug = Debug('api-docs-gen:generator')

/**
 * generate markdown contents
 *
 * @param input input paths
 * @param output output full path
 * @param style generate style, see {@link GenerateStyle}
 * @param config configration, see {@link Config}
 */
export async function generate(
  input: string[],
  output: string,
  style: GenerateStyle,
  config: Config,
  callback?: (pkgname: string, filename: string) => void
): Promise<void> {
  debug(`config`, config)
  debug('style', style)

  const apiModel = new ApiModel()
  for (const target of input) {
    debug(`generate from ${target} ...`)
    const apiPackage = loadPackage(target, apiModel)

    let result = config.processor(
      apiModel,
      apiPackage,
      style,
      config.linkReferencer! // eslint-disable-line @typescript-eslint/no-non-null-assertion
    )

    if (isString(result)) {
      result = [
        {
          filename: 'api.md',
          body: result
        }
      ]
    }

    if (!Array.isArray(result)) {
      throw new Error('Not supported processor result type')
    }

    let outputTarget = output
    if (style === 'directory') {
      outputTarget = path.resolve(output, apiPackage.displayName)
      try {
        await mkdir(outputTarget)
      } catch (e) {
        throw new Error(`Cannot make '${outputTarget} directory: ${e.message}`)
      }
    }

    for (const { filename, body } of result) {
      const filepath = path.resolve(
        outputTarget,
        style === 'prefix' ? `${apiPackage.displayName}-${filename}` : filename
      )
      await writeFile(filepath, body)
      callback && callback(apiPackage.displayName, filepath)
    }
  }
}

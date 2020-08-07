import path from 'path'
import { ApiModel } from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { loadPackage } from './resolver'
import { isString, mkdir, writeFile } from './utils'

import type { Config, GenerateStyle } from './config'

const debug = Debug('api-docs-gen:generator')

/**
 * Generate API docs
 *
 * @param input - input paths
 * @param output - output api docs full path
 * @param style - generate style, see the {@link GenerateStyle}
 * @param config - configration, see the {@link Config}
 *
 * @public
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
    }

    for (const { filename, body } of result) {
      const filepath = path.resolve(
        outputTarget,
        style === 'prefix' ? `${apiPackage.displayName}-${filename}` : filename
      )
      const parsedPath = path.parse(filepath)
      try {
        await mkdir(parsedPath.dir)
      } catch (e) {
        throw new Error(
          `Cannot make '${parsedPath.dir} directory: ${e.message}`
        )
      }
      await writeFile(filepath, body)
      callback && callback(apiPackage.displayName, filepath)
    }
  }
}

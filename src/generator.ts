import path from 'path'
import { ApiModel } from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { loadPackage, loadTSDocConfig, mergeTSDocTagDefinition } from './tsdoc'
import { isString, mkdir, writeFile } from './utils'

import type { Config, GenerateStyle } from './config'

const debug = Debug('api-docs-gen:generator')

/**
 * Generate Options for Generate API
 *
 * @public
 */
export interface GenerateOptions {
  /**
   * generate style
   *
   * @remarks
   * see the {@link GenerateStyle}
   */
  style: GenerateStyle
  /**
   * configration
   *
   * @remarks
   * see the {@link Config}
   */
  config: Config
  /**
   * TSDoc configration path
   *
   * @remarks
   * Optional, see the {@link https://github.com/microsoft/tsdoc/tree/master/tsdoc-config | here}
   */
  tsdocConfigPath?: string
  /**
   * generate done callback
   *
   * @remarks
   * The callback that will be called when the generate process is finished.
   */
  done?: (pkgname: string, filename: string) => void
  /**
   * TSDoc configration error callback
   *
   * @remarks
   * The callback occurs if you have an error in configration when `--tsdoc-config` is specified
   */
  errorOnTSDocConfig?: (error: string) => void
}

/**
 * Generate API docs
 *
 * @param input - input paths
 * @param output - output api docs full path
 * @param options - optiosn for generate, see the {@link GenerateOptions}
 *
 * @public
 */
export async function generate(
  input: string[],
  output: string,
  options: GenerateOptions
): Promise<void> {
  const { style, config, tsdocConfigPath, done, errorOnTSDocConfig } = options
  debug(`config`, config)
  debug('style', style)
  debug('tsdocConfig', tsdocConfigPath)

  let customTags: string[] = []
  if (tsdocConfigPath) {
    try {
      const tsdocConfig = loadTSDocConfig(tsdocConfigPath)
      customTags = mergeTSDocTagDefinition(tsdocConfig.tagDefinitions)
      debug('TSDoc custom tags:', customTags)
    } catch (e) {
      debug('error on TSDoc Configration', e.message)
      errorOnTSDocConfig && errorOnTSDocConfig(e.message)
    }
  }

  const apiModel = new ApiModel()
  for (const target of input) {
    debug(`generate from ${target} ...`)
    const apiPackage = loadPackage(target, apiModel)

    let result = config.processor(
      apiModel,
      apiPackage,
      style,
      config.linkReferencer!,
      customTags
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
      done && done(apiPackage.displayName, filepath)
    }
  }
}

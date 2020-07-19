import path from 'path'
import fs from 'fs'
import type {
  ApiModel,
  ApiPackage,
  ApiItem
} from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { multi as multiResolver } from './resolver'
import { multi as multiProcessor } from './processor'

const debug = Debug('api-docs-gen:config')

/**
 * Configuration
 *
 * @public
 */
export interface Config {
  /**
   * markdown link reference {@link ReferenceResolver | resolver}
   */
  linkReferencer?: ReferenceResolver
  /**
   * markdown docs {@link MarkdownProcessor | processor}
   */
  processor: MarkdownProcessor
}

/**
 * Markdown reference resolver
 *
 * @param style - generate style, See the {@link GenerateStyle}
 * @param item - a {@link https://rushstack.io/pages/api/api-extractor-model.apiitem/ | item}
 * @param model - a {@link https://rushstack.io/pages/api/api-extractor-model.apimodel/ | model}
 * @param pkg - a {@link https://rushstack.io/pages/api/api-extractor-model.apipackage/ | package}
 *
 * @returns resolved reference path
 *
 * @public
 */
export type ReferenceResolver = (
  style: GenerateStyle,
  item: ApiItem,
  model: ApiModel,
  pkg: ApiPackage
) => string

/**
 * Markdown content
 *
 * @public
 */
export interface MarkdownContent {
  /**
   * markdown filename
   */
  filename: string
  /**
   * mkarkdown content
   */
  body: string
}

/**
 * Markdown docs processor
 *
 * @param model - a {@link https://rushstack.io/pages/api/api-extractor-model.apimodel/ | model}
 * @param pkg - a {@link https://rushstack.io/pages/api/api-extractor-model.apipackage/ | package}
 * @param style - generate style. see the {@link GenerateStyle}
 * @param resolver - the markdown reference {@link ReferenceResolver | resolver}. if you're specfified at {@link Config}, it's passed, else it's not specified passed internal refenrece resolver.
 *
 * @returns markdown content
 *
 * @public
 */
export type MarkdownProcessor = (
  model: ApiModel,
  pkg: ApiPackage,
  style: GenerateStyle,
  resolver: ReferenceResolver
) => string | MarkdownContent[]

/**
 * The generate style
 *
 * @remarks
 * The value of this constants is the same as that taken from `--genereate-style` option.
 *
 * @public
 */
export const enum GenerateStyle {
  /**
   * Prefix the output api docs file name with package name
   */
  Prefix = 'prefix',
  /**
   * Output api docs files for each package
   */
  Directory = 'directory'
}

export const DefaultConfig: Config = {
  linkReferencer: multiResolver,
  processor: multiProcessor
}

export function resolveConfig(configPath?: string | null): Config {
  debug('configPath', configPath)
  const cwd = process.cwd()
  let config: Config | undefined
  let resolvedPath: string | undefined

  if (configPath) {
    resolvedPath = path.resolve(cwd, configPath)
    const stat = fs.statSync(resolvedPath)
    if (!stat.isFile) {
      throw new Error('Not found file')
    }
  } else {
    const configPath = path.resolve(cwd, 'docsgen.config.js')
    try {
      fs.accessSync(configPath, fs.constants.F_OK)
      resolvedPath = configPath
    } catch (e) {
      debug(`config access error: ${e.message}`)
    }
  }

  if (!resolvedPath) {
    return DefaultConfig
  }

  try {
    try {
      config = require(resolvedPath)
      debug('processor importing', resolvedPath, config)
    } catch (e) {
      if (
        !/Cannot use import statement|Unexpected token 'export'/.test(e.message)
      ) {
        throw e
      }
    }

    if (config) {
      config.linkReferencer = config.linkReferencer || multiResolver
      return config
    } else {
      return DefaultConfig
    }
  } catch (e) {
    throw new Error(`Failed to load config from ${resolvedPath}: ${e.message}`)
  }
}

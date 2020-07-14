import path from 'path'
import fs from 'fs'
import type {
  ApiModel,
  ApiPackage,
  ApiItem
} from '@microsoft/api-extractor-model'
import { debug as Debug } from 'debug'
import { resolve } from './resolver'
import { process as markdownProcessor } from './processor'

const debug = Debug('api-docs-gen:config')

/**
 * Configuration
 */
export interface Config {
  /**
   * markdown link reference resolver
   */
  linkReferencer?: ReferenceResolver
  /**
   * markdown docs processor
   */
  processor: MarkdownProcessor
}

/**
 * Markdown reference resolver
 *
 * @param item the item of `api-extractor-model`
 * @param model the model of `api-extractor-model`
 * @param pkg the package of `api-extractor-model`
 *
 * @returns resolved reference path
 */
export type ReferenceResolver = (
  item: ApiItem,
  model: ApiModel,
  pkg: ApiPackage
) => string

/**
 * Markdown content
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
 * @param model the api model of `api-extractor-model`
 * @param package the package of `api-extractor-model`
 * @param resolver the markdown reference resolver. if you're specfified at {@link Config}, it's passed, else it's not specified passed internal refenrece resolver.
 *
 * @returns markdown content
 */
export type MarkdownProcessor = (
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver
) => string | MarkdownContent[]

/**
 * Default Config
 */
export const defaultConfig: Config = {
  linkReferencer: resolve,
  processor: markdownProcessor
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
    return defaultConfig
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
      config.linkReferencer = config.linkReferencer || resolve
      return config
    } else {
      return defaultConfig
    }
  } catch (e) {
    throw new Error(`Failed to load config from ${resolvedPath}: ${e.message}`)
  }
}

import type {
  ApiModel,
  ApiPackage,
  ApiItem
} from '@microsoft/api-extractor-model'

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
 *
 * @returns resolved reference path
 */
export type ReferenceResolver = (item: ApiItem, model: ApiModel) => string

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

import { ApiItem } from '@microsoft/api-extractor-model'
/**
 * Markdown reference resolver
 */
export type Resolver = (item: ApiItem) => string

/**
 * Markdonw content
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
 * model processor
 *
 * @param model the model of docs
 * @returns markdown content
 */
export type Processor = (model: unknown) => string | MarkdownContent[]

import type { Resolver, Processor } from './types'

/**
 * Configuration
 */
export interface Config {
  /**
   * markdown link reference resolver
   */
  resolver?: Resolver
  /**
   * model processor
   */
  processor: Processor
}

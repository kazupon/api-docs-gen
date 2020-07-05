import type { Resolver, Processor } from './types'

/**
 * Configration
 */
export interface Config {
  /**
   * markdown link reference resolver
   */
  resolver?: Resolver
  /**
   * processor
   */
  processor: Processor
}

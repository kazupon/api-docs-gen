import type { ApiPackage, ApiModel } from '@microsoft/api-extractor-model'
import type { Resolver } from './types'

export function transform(
  pkg: ApiPackage,
  model: ApiModel,
  resolver: Resolver
): unknown {
  // TODO:
  return pkg
}

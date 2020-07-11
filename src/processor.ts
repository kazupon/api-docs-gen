import type { ApiModel, ApiPackage } from '@microsoft/api-extractor-model'
import { MarkdownContent, ReferenceResolver } from './types'

export function process(
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver
): string | MarkdownContent[] {
  // TODO:
  return [
    {
      filename: 'functions.md',
      body: '# Functions'
    },
    {
      filename: 'enumerations.md',
      body: '# Enumerations'
    }
  ]
}

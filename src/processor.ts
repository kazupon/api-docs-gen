import { MarkdownContent } from './types'

export function process(model: unknown): string | MarkdownContent[] {
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

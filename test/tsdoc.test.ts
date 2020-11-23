import { resolve } from 'path'
import { TSDocTagSyntaxKind } from '@microsoft/tsdoc'
import { AedocDefinitions } from '@microsoft/api-extractor-model'
import { loadTSDocConfig, mergeTSDocTagDefinition } from '../src/tsdoc'

test('loadTSDocConfig', () => {
  const tsdocConfigPath = resolve(__dirname, './fixtures/tsdoc.json')
  const { tagDefinitions } = loadTSDocConfig(tsdocConfigPath)

  expect(tagDefinitions.length).toEqual(1)
  expect(tagDefinitions[0].syntaxKind).toEqual(TSDocTagSyntaxKind.ModifierTag)
  expect(tagDefinitions[0].tagName).toEqual('@myTag')
})

test('mergeTSDocTagDefinition', () => {
  const beforeLength = AedocDefinitions.tsdocConfiguration.tagDefinitions.length
  const tsdocConfigPath = resolve(__dirname, './fixtures/tsdoc.json')
  const { tagDefinitions } = loadTSDocConfig(tsdocConfigPath)
  const customTags = mergeTSDocTagDefinition(tagDefinitions)
  const afterLength = AedocDefinitions.tsdocConfiguration.tagDefinitions.length
  const myTagDefine = AedocDefinitions.tsdocConfiguration.tagDefinitions.find(
    tag => tag.tagName === '@myTag'
  )

  expect(beforeLength).not.toEqual(afterLength)
  expect(myTagDefine!.tagName).toEqual('@myTag')
  expect(myTagDefine!.syntaxKind).toEqual(TSDocTagSyntaxKind.ModifierTag)
  expect(customTags.length).toEqual(1)
  expect(customTags[0]).toEqual('@myTag')
})

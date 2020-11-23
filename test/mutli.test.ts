import path from 'path'
import { ApiModel } from '@microsoft/api-extractor-model'
import { multi as multiResolver } from '../src/resolver'
import { multi as multiProcessor } from '../src/processor'
import { loadTSDocConfig, mergeTSDocTagDefinition } from '../src/tsdoc'
import { MarkdownContent, GenerateStyle } from '../src/config'

test('multi', () => {
  const apiModel = new ApiModel()
  const target = path.resolve(__dirname, './fixtures/library1.api.json')
  const apiPackage = apiModel.loadPackage(target)
  const contents = multiProcessor(
    apiModel,
    apiPackage,
    GenerateStyle.Prefix,
    multiResolver
  ) as MarkdownContent[]
  for (const content of contents) {
    expect(content.body).toMatchSnapshot(content.filename)
  }
})

test('multi with custom tags', () => {
  const tsdocConfigPath = path.resolve(
    __dirname,
    './fixtures/tsdoc.library1.json'
  )
  const { tagDefinitions } = loadTSDocConfig(tsdocConfigPath)
  const customTags = mergeTSDocTagDefinition(tagDefinitions)
  const apiModel = new ApiModel()
  const target = path.resolve(__dirname, './fixtures/library1.custom.api.json')
  const apiPackage = apiModel.loadPackage(target)
  const contents = multiProcessor(
    apiModel,
    apiPackage,
    GenerateStyle.Prefix,
    multiResolver,
    customTags
  ) as MarkdownContent[]
  for (const content of contents) {
    expect(content.body).toMatchSnapshot(content.filename)
  }
})

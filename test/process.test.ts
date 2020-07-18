import path from 'path'
import { ApiModel } from '@microsoft/api-extractor-model'
import { resolve } from '../src/resolver'
import { process } from '../src/processor'
import { MarkdownContent } from '../src/config'

test('processor', () => {
  const apiModel = new ApiModel()
  const target = path.resolve(__dirname, './fixtures/library1.api.json')
  const apiPackage = apiModel.loadPackage(target)
  const contents = process(
    apiModel,
    apiPackage,
    'prefix',
    resolve
  ) as MarkdownContent[]
  for (const content of contents) {
    expect(content.body).toMatchSnapshot(content.filename)
  }
})

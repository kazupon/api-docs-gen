import path from 'path'
import { ApiModel } from '@microsoft/api-extractor-model'
import { toc as tocResolver } from '../src/resolver'
import { toc as tocProcessor } from '../src/processor'
import { GenerateStyle } from '../src/config'

test('toc', () => {
  const apiModel = new ApiModel()
  const target = path.resolve(__dirname, './fixtures/library1.api.json')
  const apiPackage = apiModel.loadPackage(target)
  const content = tocProcessor(
    apiModel,
    apiPackage,
    GenerateStyle.Prefix,
    tocResolver
  )
  expect(content).toMatchSnapshot()
})

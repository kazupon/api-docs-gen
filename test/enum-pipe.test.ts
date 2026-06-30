import path from 'path'
import { ApiModel, ApiItemKind, ApiEnum } from '@microsoft/api-extractor-model'
import { createContentBuilder } from '../src/builder'
import { buildEnumContent } from '../src/processor/utils'
import { GenerateStyle } from '../src/config'

test('enum member initializer containing a pipe is escaped for the table cell', () => {
  const model = new ApiModel()
  const pkg = model.loadPackage(
    path.resolve(__dirname, './fixtures/enum-pipe.api.json')
  )
  const apiEnum = pkg.members[0].members.find(
    m => m.kind === ApiItemKind.Enum
  ) as ApiEnum

  const builder = createContentBuilder()
  buildEnumContent(
    GenerateStyle.Prefix,
    model,
    pkg,
    () => '',
    builder,
    apiEnum,
    []
  )

  const content = builder.content
  // The `ReadWrite = Read | Write` initializer must keep its pipe escaped, the
  // same way the Parameters "Type" column escapes its excerpt, so the row keeps
  // three cells and the description is not pushed out of the table.
  expect(content).toContain(
    '| ReadWrite | Read &#124; Write | Combined read and write access |'
  )
  expect(content).not.toContain('| ReadWrite | Read | Write |')
})

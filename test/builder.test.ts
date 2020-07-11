import { createContentBuilder } from '../src/builder'

test('push', () => {
  const builder = createContentBuilder()
  builder.push('push')

  expect(builder.content).toEqual('push')
})

test('newline', () => {
  const builder = createContentBuilder()
  builder.push('push')
  builder.newline()
  builder.push('push')

  expect(builder.content).toEqual('push\npush')
})

test('pushline', () => {
  const builder = createContentBuilder()
  builder.pushline('pushline')

  expect(builder.content).toEqual('pushline\n')
})

test('indent / deindent', () => {
  const builder = createContentBuilder()
  builder.newline()
  builder.push('indent0')
  builder.indent()
  builder.push('indent1')
  builder.indent(true)
  builder.newline()
  builder.push('indent2')
  builder.deindent(true)
  builder.newline()
  builder.push('deindent0')
  builder.deindent()
  builder.push('deindent1')

  expect(builder.content).toEqual(`
indent0
  indent1
    indent2
  deindent0
deindent1`)
})

test('indentLevel', () => {
  // default
  const builder1 = createContentBuilder()
  expect(builder1.indentLevel).toBe(0)

  // option
  const builder2 = createContentBuilder({ indentLevel: 2 })
  builder2.push('{')
  builder2.newline()
  builder2.push('foo')
  expect(builder2.indentLevel).toBe(2)
  expect(builder2.content).toEqual('{\n    foo')

  builder2.deindent(true)
  builder2.deindent(true)
  builder2.push('bar')
  expect(builder2.indentLevel).toBe(0)
  expect(builder2.content).toEqual('{\n    foobar')
})

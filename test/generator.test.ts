import path from 'path'
import { ApiModel } from '@microsoft/api-extractor-model'

/**
 * setup ApiPackage Stub data
 */
const API_JSON1 = path.resolve(__dirname, './fixtures/library1.api.json')
const API_JSON2 = path.resolve(__dirname, './fixtures/utilities.api.json')
const model = new ApiModel()
const API_MODEL_FILES = [API_JSON1, API_JSON2]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PACKAGES: any = API_MODEL_FILES.reduce((packages, file) => {
  return Object.assign(packages, { [file]: model.loadPackage(file) })
}, {})

// mock 'resolver' module
jest.mock('../src/resolver/index', () => {
  const { multi } = jest.requireActual('../src/resolver/index')
  return {
    multi,
    loadPackage: jest.fn().mockImplementation(modelPath => PACKAGES[modelPath]) // stub
  }
})

// mock 'utils' modules
jest.mock('../src/utils', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...jest.requireActual<any>('../src/utils'),
  mkdir: jest.fn(),
  writeFile: jest.fn()
}))
import { mkdir, writeFile } from '../src/utils'

import { DefaultConfig, GenerateStyle } from '../src/config'
import { generate } from '../src/generator'

afterEach(() => {
  jest.clearAllMocks()
})

test('generate prefix style contents', async () => {
  const input = [API_JSON1, API_JSON2]
  const output = path.resolve(__dirname, './')
  await generate(input, output, {
    style: GenerateStyle.Prefix,
    config: DefaultConfig
  })

  expect(mkdir).toHaveBeenCalledTimes(7)
  expect(writeFile).toHaveBeenCalledTimes(7)
  // @ts-ignore TS2339: Property 'mock' does not exist on type '(path: string, data: string) => Promise<void>'.
  for (const arg of writeFile.mock.calls) {
    expect(
      [
        path.resolve(output, './library1-enum.md'),
        path.resolve(output, './library1-function.md'),
        path.resolve(output, './library1-variable.md'),
        path.resolve(output, './library1-class.md'),
        path.resolve(output, './library1-interface.md'),
        path.resolve(output, './library1-typealias.md'),
        path.resolve(output, './utilities-function.md')
      ].includes(arg[0])
    ).toBe(true)
    expect(arg[1]).toMatchSnapshot()
  }
})

test('generate directory style contents', async () => {
  const input = [API_JSON1, API_JSON2]
  const output = path.resolve(__dirname, './')
  await generate(input, output, {
    style: GenerateStyle.Directory,
    config: DefaultConfig
  })

  expect(mkdir).toHaveBeenCalledTimes(7)

  const passedArgs = [
    path.resolve(output, './library1/enum.md'),
    path.resolve(output, './library1/function.md'),
    path.resolve(output, './library1/variable.md'),
    path.resolve(output, './library1/class.md'),
    path.resolve(output, './library1/interface.md'),
    path.resolve(output, './library1/typealias.md'),
    path.resolve(output, './utilities/function.md')
  ]
  expect(writeFile).toHaveBeenCalledTimes(7)
  // @ts-ignore TS2339: Property 'mock' does not exist on type '(path: string, data: string) => Promise<void>'.
  for (const arg of writeFile.mock.calls) {
    expect(passedArgs.includes(arg[0])).toBe(true)
    expect(arg[1]).toMatchSnapshot()
  }
})

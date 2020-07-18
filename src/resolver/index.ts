import type { ApiModel, ApiPackage } from '@microsoft/api-extractor-model'

export { resolve as multi } from './multi'
export { resolve as toc } from './toc'

export function loadPackage(modelPath: string, model: ApiModel): ApiPackage {
  try {
    return model.loadPackage(modelPath)
  } catch (e) {
    throw new Error(`Cannot load package model from ${modelPath}: ${e.message}`)
  }
}

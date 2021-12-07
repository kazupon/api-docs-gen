import { TSDocConfigFile } from '@microsoft/tsdoc-config'
import { AedocDefinitions } from '@microsoft/api-extractor-model'

import type { ApiModel, ApiPackage } from '@microsoft/api-extractor-model'
import type { TSDocTagDefinition } from '@microsoft/tsdoc'

export function loadPackage(modelPath: string, model: ApiModel): ApiPackage {
  try {
    return model.loadPackage(modelPath)
  } catch (e) {
    throw new Error(
      `Cannot load package model from ${modelPath}: ${(e as Error).message}`
    )
  }
}

export function loadTSDocConfig(path: string): TSDocConfigFile {
  const tsdocConfig = TSDocConfigFile.loadFile(path)
  if (tsdocConfig.hasErrors) {
    throw new Error(tsdocConfig.getErrorSummary())
  }
  return tsdocConfig
}

export function mergeTSDocTagDefinition(
  definitions: readonly TSDocTagDefinition[]
): string[] {
  const tsdocConfig = AedocDefinitions.tsdocConfiguration
  const customTags = [] as string[]

  definitions.forEach(definition => {
    if (tsdocConfig.tryGetTagDefinition(definition.tagName) == null) {
      // @ts-ignore
      tsdocConfig.addTagDefinition(definition)
      customTags.push(definition.tagName)
    }
  })

  return customTags
}

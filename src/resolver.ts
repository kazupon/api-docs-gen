import type {
  ApiItem,
  ApiModel,
  ApiPackage
} from '@microsoft/api-extractor-model'
import { getSafePathFromDisplayName } from './utils'
import { GenerateStyle } from './config'

export function resolve(
  style: GenerateStyle,
  item: ApiItem,
  model: ApiModel, // eslint-disable-line @typescript-eslint/no-unused-vars
  pkg: ApiPackage
): string {
  if (item.kind === 'Model') {
    return './index'
  }

  let baseName = ''
  const pkgName = pkg.displayName
  for (const hierarchyItem of item.getHierarchy()) {
    const qualifiedName = getSafePathFromDisplayName(hierarchyItem.displayName)
    switch (hierarchyItem.kind) {
      case 'Model':
      case 'EntryPoint':
      case 'Package':
        break
      case 'Enum':
      case 'Function':
      case 'Variable':
      case 'TypeAlias':
        baseName += `${hierarchyItem.kind.toLowerCase()}#${qualifiedName}`
        break
      default:
        baseName += '.' + qualifiedName
    }
  }

  return style === GenerateStyle.Prefix
    ? `./${pkgName}-${baseName}`
    : `./${baseName}`
}

export function loadPackage(modelPath: string, model: ApiModel): ApiPackage {
  try {
    return model.loadPackage(modelPath)
  } catch (e) {
    throw new Error(`Cannot load package model from ${modelPath}: ${e.message}`)
  }
}

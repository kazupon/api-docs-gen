import type { ApiItem, ApiModel } from '@microsoft/api-extractor-model'
import { getSafePathFromDisplayName } from './utils'

export function resolve(item: ApiItem, model: ApiModel): string {
  if (item.kind === 'Model') {
    return './index'
  }

  let baseName = ''
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
  return './' + baseName
}

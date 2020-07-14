import type {
  ApiItem,
  ApiModel,
  ApiPackage
} from '@microsoft/api-extractor-model'
import { getSafePathFromDisplayName } from './utils'

export function resolve(
  item: ApiItem,
  model: ApiModel, // eslint-disable-line @typescript-eslint/no-unused-vars
  pkg: ApiPackage // eslint-disable-line @typescript-eslint/no-unused-vars
): string {
  if (item.kind === 'Model') {
    return './index'
  }

  let baseName = ''
  // const pakcageBase = pkg.displayName
  const pakcageBase = ''
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

  return pakcageBase ? `./${pakcageBase}/${baseName}` : `./${baseName}`
}

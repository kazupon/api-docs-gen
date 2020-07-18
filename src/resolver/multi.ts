import type {
  ApiItem,
  ApiModel,
  ApiPackage
} from '@microsoft/api-extractor-model'
import { ApiItemKind } from '@microsoft/api-extractor-model'
import { getSafePathFromDisplayName } from '../utils'
import { GenerateStyle } from '../config'

export function resolve(
  style: GenerateStyle,
  item: ApiItem,
  model: ApiModel, // eslint-disable-line @typescript-eslint/no-unused-vars
  pkg: ApiPackage
): string {
  let baseName = ''
  const pkgName = pkg.displayName
  for (const hierarchyItem of item.getHierarchy()) {
    const qualifiedName = getSafePathFromDisplayName(hierarchyItem.displayName)
    switch (hierarchyItem.kind) {
      case ApiItemKind.Model:
      case ApiItemKind.EntryPoint:
      case ApiItemKind.Package:
        break
      case ApiItemKind.Enum:
      case ApiItemKind.Function:
      case ApiItemKind.Variable:
      case ApiItemKind.TypeAlias:
      case ApiItemKind.Class:
      case ApiItemKind.Interface:
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

import type {
  ApiItem,
  ApiModel,
  ApiPackage
} from '@microsoft/api-extractor-model'
import { ApiItemKind } from '@microsoft/api-extractor-model'
import { getSafePathFromDisplayName } from '../utils'
import { GenerateStyle } from '../config'

export function resolve(
  style: GenerateStyle, // eslint-disable-line @typescript-eslint/no-unused-vars
  item: ApiItem,
  model: ApiModel, // eslint-disable-line @typescript-eslint/no-unused-vars
  pkg: ApiPackage // eslint-disable-line @typescript-eslint/no-unused-vars
): string {
  let baseName = ''
  for (const hierarchyItem of item.getHierarchy()) {
    const qualifiedName = getSafePathFromDisplayName(hierarchyItem.displayName)
    switch (hierarchyItem.kind) {
      case ApiItemKind.Enum:
      case ApiItemKind.Function:
      case ApiItemKind.Variable:
      case ApiItemKind.TypeAlias:
      case ApiItemKind.Class:
      case ApiItemKind.Interface:
        baseName = `#${qualifiedName}`
        break
      default:
        break
    }
  }

  return baseName
}

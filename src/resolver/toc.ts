/* eslint-disable @typescript-eslint/no-unused-vars */

import type {
  ApiItem,
  ApiModel,
  ApiPackage
} from '@microsoft/api-extractor-model'
import { ApiItemKind } from '@microsoft/api-extractor-model'
import { getSafePathFromDisplayName } from '../utils'
import { GenerateStyle } from '../config'

/**
 * Resolve the markdown content reference
 *
 * @remarks
 * This reference resolver is used by the {@link tocProcessor | processor} to generate a reference specifically for API docs of markdown content with TOC.
 *
 * @param style - generate style, See the {@link GenerateStyle}
 * @param item - a {@link https://rushstack.io/pages/api/api-extractor-model.apiitem/ | item}
 * @param model - a {@link https://rushstack.io/pages/api/api-extractor-model.apimodel/ | model}
 * @param pkg - a {@link https://rushstack.io/pages/api/api-extractor-model.apipackage/ | package}
 * @param customTags - TSDoc custom tags. This parameter is set to an array of custom tag names defined in `--tsdoc-config`.
 *
 * @returns resolved the reference string
 *
 * @public
 */
export function resolve(
  style: GenerateStyle,
  item: ApiItem,
  model: ApiModel,
  pkg: ApiPackage,
  customTags?: string[] // eslint-disable-line @typescript-eslint/no-unused-vars
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

/* eslint-enable @typescript-eslint/no-unused-vars */

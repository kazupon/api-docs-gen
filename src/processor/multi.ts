import {
  ApiItemKind,
  ApiModel,
  ApiPackage,
  ApiItem
} from '@microsoft/api-extractor-model'
import type {
  MarkdownContent,
  ReferenceResolver,
  GenerateStyle
} from '../config'
import { ContentBuilder, createContentBuilder } from '../builder'
import {
  buildClassContent,
  buildEnumContent,
  buildFunctionContent,
  buildInterfaceContent,
  buildTypeAliasContent,
  buildVariableContent
} from './utils'

/**
 * Process of API doc model
 *
 * @remarks
 * Generate the markdown contents the bellow:
 *
 * ```
 * - Function
 * - Enum
 * - Interface
 * - Class
 * - Variable
 * - TypeAlias
 * ```
 *
 * @param model - a {@link https://rushstack.io/pages/api/api-extractor-model.apimodel/ | model}
 * @param pkg - a {@link https://rushstack.io/pages/api/api-extractor-model.apipackage/ | package}
 * @param style - generate style, See the {@link GenerateStyle}
 * @param resolver - {@link ReferenceResolver | resolver} to resolve markdown content references
 * @param customTags - TSDoc custom tags. This parameter is set to an array of custom tag names defined in `--tsdoc-config`.
 *
 * @returns markdown content strign or Array of {@link MarkdownContent}
 *
 * @public
 */
export function process(
  model: ApiModel,
  pkg: ApiPackage,
  style: GenerateStyle,
  resolver: ReferenceResolver,
  customTags?: string[]
): string | MarkdownContent[] {
  // build
  function build(pkg: ApiPackage): Map<string, ContentBuilder> {
    const builders = new Map<string, ContentBuilder>()
    const items = pkg.members[0] ? pkg.members[0].members : []

    buildMarkdown(builders, items)
    return builders
  }

  // build markdown
  function buildMarkdown(
    builders: Map<string, ContentBuilder>,
    items: readonly ApiItem[]
  ): void {
    for (const item of items) {
      const { kind } = item
      let builder = builders.get(kind)
      if (!builder) {
        builder = createContentBuilder()
        builder.pushline(`# ${kind}`)
        builder.newline()
        builders.set(kind, builder)
      }

      switch (kind) {
        case ApiItemKind.Function:
          buildFunctionContent(
            style,
            model,
            pkg,
            resolver,
            builder,
            item,
            customTags || []
          )
          break
        case ApiItemKind.Enum:
          buildEnumContent(
            style,
            model,
            pkg,
            resolver,
            builder,
            item,
            customTags || []
          )
          break
        case ApiItemKind.Interface:
          buildInterfaceContent(
            style,
            model,
            pkg,
            resolver,
            builder,
            item,
            customTags || []
          )
          break
        case ApiItemKind.Class:
          buildClassContent(
            style,
            model,
            pkg,
            resolver,
            builder,
            item,
            customTags || []
          )
          break
        case ApiItemKind.TypeAlias:
          buildTypeAliasContent(
            style,
            model,
            pkg,
            resolver,
            builder,
            item,
            customTags || []
          )
          break
        case ApiItemKind.Variable:
          buildVariableContent(
            style,
            model,
            pkg,
            resolver,
            builder,
            item,
            customTags || []
          )
          break
        default:
          break
      }
    }
  }

  function generate(builders: Map<string, ContentBuilder>): MarkdownContent[] {
    const contents = []
    for (const [kind, builder] of builders) {
      const content = builder.content
      contents.push({
        filename: `${kind.toLowerCase()}.md`,
        body: content
      })
    }
    return contents
  }

  // build markdown content!
  const builders = build(pkg)

  // generate markdown content!
  return generate(builders)
}

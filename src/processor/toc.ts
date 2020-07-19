import {
  ApiItemKind,
  ApiModel,
  ApiPackage
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
 * Generate the markdown contents that have TOC.
 * About API doc model, see the {@link https://api-extractor.com/pages/overview/demo_docs/ | doc model structure}, and {@link https://github.com/microsoft/rushstack/tree/master/apps/api-extractor-model | doc model API}.
 * In about generate api docs, see the {@link https://github.com/kazupon/api-docs-gen/blob/master/api-docs-gen-api.md | api-docs-gen API References}
 *
 * @param model - a {@link https://rushstack.io/pages/api/api-extractor-model.apimodel/ | model}
 * @param pkg - a {@link https://rushstack.io/pages/api/api-extractor-model.apipackage/ | package}
 * @param style - generate style, See the {@link GenerateStyle}
 * @param resolver - {@link ReferenceResolver | resolver} to resolve markdown content references
 *
 * @returns markdown string content that have TOC
 *
 * @public
 */
export function process(
  model: ApiModel,
  pkg: ApiPackage,
  style: GenerateStyle,
  resolver: ReferenceResolver
): string | MarkdownContent[] {
  function build(): string {
    const builder = createContentBuilder()

    builder.pushline(`# ${pkg.displayName} API References`)
    builder.newline()

    buildTOC(builder)
    buildContents(builder)

    return builder.content
  }

  function buildTOC(builder: ContentBuilder): void {
    builder.pushline(`## Table Of Contents`)
    builder.newline()
    const builders = new Map<string, ContentBuilder>()

    const items = pkg.members[0] ? pkg.members[0].members : []
    for (const item of items) {
      const { kind } = item
      let tocBuilder = builders.get(kind)
      if (!tocBuilder) {
        tocBuilder = createContentBuilder()
        tocBuilder.pushline(`- [${kind}](#${kind.toLowerCase()})`)
        builders.set(kind, tocBuilder)
      }
      tocBuilder.pushline(
        `  - [${item.displayName}](#${item.displayName.toLowerCase()})`
      )
    }

    for (const [, tocBuilder] of builders) {
      builder.push(tocBuilder.content)
    }

    builder.newline()
  }

  function buildContents(builder: ContentBuilder): void {
    const builders = new Map<string, ContentBuilder>()
    const items = pkg.members[0] ? pkg.members[0].members : []

    for (const item of items) {
      const { kind } = item
      let contentBuilder = builders.get(kind)
      if (!contentBuilder) {
        contentBuilder = createContentBuilder()
        contentBuilder.pushline(`## ${kind}`)
        contentBuilder.newline()
        builders.set(kind, contentBuilder)
      }

      switch (kind) {
        case ApiItemKind.Function:
          buildFunctionContent(
            style,
            model,
            pkg,
            resolver,
            contentBuilder,
            item,
            3
          )
          break
        case ApiItemKind.Enum:
          buildEnumContent(style, model, pkg, resolver, contentBuilder, item, 3)
          break
        case ApiItemKind.Interface:
          buildInterfaceContent(
            style,
            model,
            pkg,
            resolver,
            contentBuilder,
            item,
            3
          )
          break
        case ApiItemKind.Class:
          buildClassContent(
            style,
            model,
            pkg,
            resolver,
            contentBuilder,
            item,
            3
          )
          break
        case ApiItemKind.TypeAlias:
          buildTypeAliasContent(
            style,
            model,
            pkg,
            resolver,
            contentBuilder,
            item,
            3
          )
          break
        case ApiItemKind.Variable:
          buildVariableContent(
            style,
            model,
            pkg,
            resolver,
            contentBuilder,
            item,
            3
          )
          break
        default:
          break
      }
    }

    for (const [, contentBuilder] of builders) {
      builder.pushline(contentBuilder.content)
    }
  }

  return build()
}

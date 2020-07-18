import {
  ApiItemKind,
  ApiModel,
  ApiPackage,
  ApiItem,
  ApiDeclaredItem,
  ApiParameterListMixin,
  IResolveDeclarationReferenceResult,
  ApiEnumMember
} from '@microsoft/api-extractor-model'
import {
  DocBlock,
  DocNodeKind,
  DocSection,
  DocPlainText,
  DocCodeSpan,
  IDocLinkTagParameters,
  DocDeclarationReference,
  DocFencedCode
} from '@microsoft/tsdoc'
import type { DeclarationReference } from '@microsoft/tsdoc/lib/beta/DeclarationReference'
import { debug as Debug } from 'debug'
import type {
  MarkdownContent,
  ReferenceResolver,
  GenerateStyle
} from './config'
import { ContentBuilder, createContentBuilder } from './builder'
import { escapeText } from './utils'

const debug = Debug('api-docs-gen:processor')

export function process(
  model: ApiModel,
  pkg: ApiPackage,
  style: GenerateStyle,
  resolver: ReferenceResolver
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
      // console.log('buildMarkdown item', item)
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
          buildFunctionMarkdown(builder, item)
          break
        case ApiItemKind.Enum:
          buildEnumMarkdown(builder, item)
          break
        case ApiItemKind.Interface:
          buildInterfaceMarkdown(builder, item)
          break
        case ApiItemKind.Class:
          buildClassMarkdown(builder, item)
          break
        case ApiItemKind.TypeAlias:
          buildTypeAliasMarkdown(builder, item)
          break
        case ApiItemKind.Variable:
          buildVariableMarkdown(builder, item)
          break
        default:
          break
      }
    }
  }

  // build function markdown
  function buildFunctionMarkdown(builder: ContentBuilder, item: ApiItem): void {
    builder.pushline(`## ${item.displayName}`)
    builder.newline()

    const itemDeclared = item as ApiDeclaredItem
    const docs = itemDeclared.tsdocComment
    if (!docs) {
      return
    }

    // summary
    if (docs.summarySection) {
      builder.pushline(
        // @ts-ignore
        getDocSectionContent(model, pkg, docs.summarySection, item, resolver)
      )
      builder.newline()
    }

    // signature
    if (itemDeclared.excerptTokens) {
      builder.pushline(`**Signature:**`)
      builder.pushline('```typescript')
      builder.pushline(
        itemDeclared.excerptTokens.map(token => token.text).join('')
      )
      builder.pushline('```')
      builder.newline()
    }

    // parameters
    const itemParam = item as ApiParameterListMixin
    if (itemParam.parameters) {
      builder.pushline(`### Parameters`)
      builder.newline()
      builder.pushline(`| Parameter | Type | Description |`)
      builder.pushline(`| --- | --- | --- |`)
      for (const p of itemParam.parameters) {
        builder.pushline(
          `| ${p.name} | ${p.parameterTypeExcerpt.text.trim()} | ${
            p.tsdocParamBlock && p.tsdocParamBlock.content
              ? getDocSectionContent(
                  model,
                  pkg,
                  // @ts-ignore TODO:
                  p.tsdocParamBlock.content,
                  item,
                  style,
                  resolver
                )
              : ''
          } |`
        )
      }
      builder.newline()
    }

    // returns
    if (docs.returnsBlock) {
      builder.pushline(`### Returns`)
      builder.newline()
      builder.pushline(
        getDocSectionContent(
          model,
          pkg,
          // @ts-ignore TODO:
          docs.returnsBlock.content,
          item,
          style,
          resolver
        )
      )
      builder.newline()
    }

    // throws
    // @ts-ignore TODO:
    const throws = getCustomTags(docs.customBlocks, '@throws')
    if (throws.length > 0) {
      builder.pushline(`### Throws`)
      builder.newline()
      for (const t of throws) {
        let text = `${getDocSectionContent(
          model,
          pkg,
          t.content,
          item,
          style,
          resolver
        )}`
        if (throws.length > 1) {
          text = `- ` + text
        }
        builder.pushline(text)
      }
      builder.newline()
    }

    // remarks
    if (docs.remarksBlock) {
      builder.pushline(`### Remarks`)
      builder.newline()
      builder.pushline(
        getDocSectionContent(
          model,
          pkg,
          // @ts-ignore TODO:
          docs.remarksBlock.content,
          item,
          style,
          resolver
        )
      )
      builder.newline()
    }

    // examples
    // @ts-ignore TODO:
    const examples = getCustomTags(docs.customBlocks, '@example')
    if (examples.length > 0) {
      builder.pushline(`### Examples`)
      builder.newline()
      let count = 1
      for (const e of examples) {
        if (examples.length > 1) {
          builder.pushline(`#### Example ${count}`)
        }
        builder.pushline(
          `${getDocSectionContent(
            model,
            pkg,
            e.content,
            item,
            style,
            resolver
          )}`
        )
        builder.newline()
        count++
      }
      builder.newline()
    }
  }

  // build enum markdown
  function buildEnumMarkdown(builder: ContentBuilder, item: ApiItem): void {
    builder.pushline(`## ${item.displayName}`)
    builder.newline()

    const itemDeclared = item as ApiDeclaredItem
    const docs = itemDeclared.tsdocComment
    if (!docs) {
      return
    }

    // summary
    if (docs.summarySection) {
      builder.pushline(
        // @ts-ignore
        getDocSectionContent(model, pkg, docs.summarySection, item, resolver)
      )
      builder.newline()
    }

    // signature
    if (itemDeclared.excerptTokens) {
      builder.pushline(`**Signature:**`)
      builder.pushline('```typescript')
      builder.pushline(
        itemDeclared.excerptTokens.map(token => token.text).join('')
      )
      builder.pushline('```')
      builder.newline()
    }

    // members
    if (item.members) {
      builder.pushline(`### Members`)
      builder.newline()
      builder.pushline(`| Member | Value| Description |`)
      builder.pushline(`| --- | --- | --- |`)
      for (const m of item.members) {
        const memberEnum = m as ApiEnumMember
        const memberDeclared = m as ApiDeclaredItem
        builder.pushline(
          `| ${memberEnum.displayName} | ${
            memberEnum.initializerExcerpt.text
          } | ${
            memberDeclared.tsdocComment &&
            memberDeclared.tsdocComment.summarySection
              ? getDocSectionContent(
                  model,
                  pkg,
                  // @ts-ignore TODO:
                  memberDeclared.tsdocComment.summarySection,
                  item,
                  style,
                  resolver
                )
              : ''
          } |`
        )
      }
      builder.newline()
    }

    // remarks
    if (docs.remarksBlock) {
      builder.pushline(`### Remarks`)
      builder.newline()
      builder.pushline(
        getDocSectionContent(
          model,
          pkg,
          // @ts-ignore TODO:
          docs.remarksBlock.content,
          item,
          style,
          resolver
        )
      )
      builder.newline()
    }

    // examples
    // @ts-ignore TODO:
    const examples = getCustomTags(docs.customBlocks, '@example')
    if (examples.length > 0) {
      builder.pushline(`### Examples`)
      builder.newline()
      let count = 1
      for (const e of examples) {
        if (examples.length > 1) {
          builder.pushline(`#### Example ${count}`)
        }
        builder.pushline(
          `${getDocSectionContent(
            model,
            pkg,
            e.content,
            item,
            style,
            resolver
          )}`
        )
        builder.newline()
        count++
      }
      builder.newline()
    }
  }

  function buildMarkdownForClassinizable(
    builder: ContentBuilder,
    item: ApiItem,
    type: string
  ) {
    const itemDeclared = item as ApiDeclaredItem
    const docs = itemDeclared.tsdocComment
    if (!docs) {
      return
    }

    // summary
    if (docs.summarySection) {
      builder.pushline(
        // @ts-ignore
        getDocSectionContent(model, pkg, docs.summarySection, item, resolver)
      )
      builder.newline()
    }

    // signature
    if (itemDeclared.excerptTokens) {
      builder.pushline(`**Signature:**`)
      builder.pushline('```typescript')
      builder.pushline(
        itemDeclared.excerptTokens.map(token => token.text).join('')
      )
      builder.pushline('```')
      builder.newline()
    }

    // parameters
    const itemParam = item as ApiParameterListMixin
    if ((type === 'constrcutor' || type === 'method') && itemParam.parameters) {
      builder.pushline(`*Parameters*`)
      builder.newline()
      builder.pushline(`| Parameter | Type | Description |`)
      builder.pushline(`| --- | --- | --- |`)
      for (const p of itemParam.parameters) {
        builder.pushline(
          `| ${p.name} | ${p.parameterTypeExcerpt.text.trim()} | ${
            p.tsdocParamBlock && p.tsdocParamBlock.content
              ? getDocSectionContent(
                  model,
                  pkg,
                  // @ts-ignore TODO:
                  p.tsdocParamBlock.content,
                  item,
                  style,
                  resolver
                )
              : ''
          } |`
        )
      }
      builder.newline()
    }

    // returns
    if (type === 'method' && docs.returnsBlock) {
      builder.pushline(`### Returns`)
      builder.newline()
      builder.pushline(
        getDocSectionContent(
          model,
          pkg,
          // @ts-ignore TODO:
          docs.returnsBlock.content,
          item,
          style,
          resolver
        )
      )
      builder.newline()
    }

    // throws
    // @ts-ignore TODO:
    const throws = getCustomTags(docs.customBlocks, '@throws')
    if ((type === 'constructor' || type === 'method') && throws.length > 0) {
      builder.pushline(`### Throws`)
      builder.newline()
      for (const t of throws) {
        let text = `${getDocSectionContent(
          model,
          pkg,
          t.content,
          item,
          style,
          resolver
        )}`
        if (throws.length > 1) {
          text = `- ` + text
        }
        builder.pushline(text)
      }
      builder.newline()
    }

    // remarks
    if (docs.remarksBlock) {
      builder.pushline(`### Remarks`)
      builder.newline()
      builder.pushline(
        getDocSectionContent(
          model,
          pkg,
          // @ts-ignore TODO:
          docs.remarksBlock.content,
          item,
          style,
          resolver
        )
      )
      builder.newline()
    }

    // examples
    // @ts-ignore TODO:
    const examples = getCustomTags(docs.customBlocks, '@example')
    if (examples.length > 0) {
      builder.pushline(`### Examples`)
      builder.newline()
      let count = 1
      for (const e of examples) {
        if (examples.length > 1) {
          builder.pushline(`#### Example ${count}`)
        }
        builder.pushline(
          `${getDocSectionContent(
            model,
            pkg,
            e.content,
            item,
            style,
            resolver
          )}`
        )
        builder.newline()
        count++
      }
      builder.newline()
    }
  }

  // build interface markdown
  function buildInterfaceMarkdown(
    builder: ContentBuilder,
    item: ApiItem
  ): void {
    builder.pushline(`## ${item.displayName}`)
    builder.newline()
    buildMarkdownForClassinizable(builder, item, 'interface')
    builder.newline()

    const methods = item.members.filter(m => m.kind === 'MethodSignature')
    builder.pushline(`### Methods`)
    builder.newline()
    for (const method of methods) {
      builder.pushline(`#### ${method.displayName}`)
      builder.newline()
      buildMarkdownForClassinizable(builder, method, 'method')
    }
    builder.newline()

    const properties = item.members.filter(m => m.kind === 'PropertySignature')
    builder.pushline(`### Properties`)
    builder.newline()
    for (const property of properties) {
      builder.pushline(`#### ${property.displayName}`)
      builder.newline()
      buildMarkdownForClassinizable(builder, property, 'property')
    }
    builder.newline()
  }

  // build class markdown
  function buildClassMarkdown(builder: ContentBuilder, item: ApiItem): void {
    builder.pushline(`## ${item.displayName}`)
    builder.newline()
    buildMarkdownForClassinizable(builder, item, 'class')
    builder.newline()

    const [ctor] = item.members.filter(m => m.kind === 'Constructor')
    builder.pushline(`### Constructor`)
    builder.newline()
    buildMarkdownForClassinizable(builder, ctor, 'constructor')
    builder.newline()

    const methods = item.members.filter(m => m.kind === 'Method')
    builder.pushline(`### Methods`)
    builder.newline()
    for (const method of methods) {
      builder.pushline(`#### ${method.displayName}`)
      builder.newline()
      buildMarkdownForClassinizable(builder, method, 'method')
    }
    builder.newline()

    const properties = item.members.filter(m => m.kind === 'Property')
    builder.pushline(`### Properties`)
    builder.newline()
    for (const property of properties) {
      builder.pushline(`#### ${property.displayName}`)
      builder.newline()
      buildMarkdownForClassinizable(builder, property, 'property')
    }
    builder.newline()
  }

  // build type alias markdown
  function buildTypeAliasMarkdown(
    builder: ContentBuilder,
    item: ApiItem
  ): void {
    builder.pushline(`## ${item.displayName}`)
    builder.newline()

    const itemDeclared = item as ApiDeclaredItem
    const docs = itemDeclared.tsdocComment
    if (!docs) {
      return
    }

    // summary
    if (docs.summarySection) {
      builder.pushline(
        // @ts-ignore
        getDocSectionContent(model, pkg, docs.summarySection, item, resolver)
      )
      builder.newline()
    }

    // signature
    if (itemDeclared.excerptTokens) {
      builder.pushline(`**Signature:**`)
      builder.pushline('```typescript')
      builder.pushline(
        itemDeclared.excerptTokens.map(token => token.text).join('')
      )
      builder.pushline('```')
      builder.newline()
    }

    // remarks
    if (docs.remarksBlock) {
      builder.pushline(`### Remarks`)
      builder.newline()
      builder.pushline(
        getDocSectionContent(
          model,
          pkg,
          // @ts-ignore TODO:
          docs.remarksBlock.content,
          item,
          style,
          resolver
        )
      )
      builder.newline()
    }

    // examples
    // @ts-ignore TODO:
    const examples = getCustomTags(docs.customBlocks, '@example')
    if (examples.length > 0) {
      builder.pushline(`### Examples`)
      builder.newline()
      let count = 1
      for (const e of examples) {
        if (examples.length > 1) {
          builder.pushline(`#### Example ${count}`)
        }
        builder.pushline(
          `${getDocSectionContent(
            model,
            pkg,
            e.content,
            item,
            style,
            resolver
          )}`
        )
        builder.newline()
        count++
      }
      builder.newline()
    }
  }

  // build variable markdown
  function buildVariableMarkdown(builder: ContentBuilder, item: ApiItem): void {
    builder.pushline(`## ${item.displayName}`)
    builder.newline()

    const itemDeclared = item as ApiDeclaredItem
    const docs = itemDeclared.tsdocComment
    if (!docs) {
      return
    }

    // summary
    if (docs.summarySection) {
      builder.pushline(
        // @ts-ignore
        getDocSectionContent(model, pkg, docs.summarySection, item, resolver)
      )
      builder.newline()
    }

    // signature
    if (itemDeclared.excerptTokens) {
      builder.pushline(`**Signature:**`)
      builder.pushline('```typescript')
      builder.pushline(
        itemDeclared.excerptTokens.map(token => token.text).join('')
      )
      builder.pushline('```')
      builder.newline()
    }

    // remarks
    if (docs.remarksBlock) {
      builder.pushline(`### Remarks`)
      builder.newline()
      builder.pushline(
        getDocSectionContent(
          model,
          pkg,
          // @ts-ignore TODO:
          docs.remarksBlock.content,
          item,
          style,
          resolver
        )
      )
      builder.newline()
    }

    // examples
    // @ts-ignore TODO:
    const examples = getCustomTags(docs.customBlocks, '@example')
    if (examples.length > 0) {
      builder.pushline(`### Examples`)
      builder.newline()
      let count = 1
      for (const e of examples) {
        if (examples.length > 1) {
          builder.pushline(`#### Example ${count}`)
        }
        builder.pushline(
          `${getDocSectionContent(
            model,
            pkg,
            e.content,
            item,
            style,
            resolver
          )}`
        )
        builder.newline()
        count++
      }
      builder.newline()
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

export function getDocSectionContent(
  model: ApiModel,
  pkg: ApiPackage,
  content: DocSection,
  contextItem: ApiItem,
  style: GenerateStyle,
  resolver: ReferenceResolver
): string {
  let ret = ''

  for (const n of content.nodes) {
    if (n.kind === DocNodeKind.Paragraph) {
      for (const nn of n.getChildNodes()) {
        if (nn.kind === DocNodeKind.PlainText) {
          ret += ((nn as unknown) as DocPlainText).text
        } else if (nn.kind === DocNodeKind.CodeSpan) {
          ret += `\`${((nn as unknown) as DocCodeSpan).code}\``
        } else if (nn.kind === DocNodeKind.LinkTag) {
          const {
            linkText,
            urlDestination,
            codeDestination
          } = (nn as unknown) as IDocLinkTagParameters
          if (codeDestination) {
            const result = resolveDeclarationReference(
              model,
              codeDestination,
              contextItem
            )
            if (result.resolvedApiItem) {
              const filepath = resolver(
                style,
                result.resolvedApiItem,
                model,
                pkg
              )
              if (linkText) {
                const encodedLinkText = escapeText(
                  linkText.replace(/\s+/g, ' ')
                )
                ret += `[${encodedLinkText}](${filepath})`
              } else {
                ret += `[${result.resolvedApiItem.displayName}](${filepath})`
              }
            }
          } else {
            if (linkText) {
              if (urlDestination) {
                const encodedLinkText = escapeText(
                  linkText.replace(/\s+/g, ' ')
                )
                ret += `[${encodedLinkText}](${urlDestination})`
              } else {
                ret += escapeText(linkText.replace(/\s+/g, ' '))
              }
            } else {
              if (urlDestination) {
                ret += urlDestination
              }
            }
          }
        }
      }
    } else if (n.kind === DocNodeKind.FencedCode) {
      const fenced = (n as unknown) as DocFencedCode
      ret += `\n`
      ret += `\`\`\`${fenced.language}\n`
      ret += fenced.code
      ret += `\`\`\``
    } else {
      debug(`ignore build doc section: ${n.kind}`)
    }
  }

  return ret
}

export function getCustomTags(
  customBlocks: readonly DocBlock[],
  tag: string
): DocBlock[] {
  return customBlocks.filter(x => x.blockTag.tagName === tag)
}

function resolveDeclarationReference(
  model: ApiModel,
  reference: DocDeclarationReference | DeclarationReference,
  item: ApiItem
): IResolveDeclarationReferenceResult {
  // @ts-ignore TODO:
  return model.resolveDeclarationReference(reference, item)
}

import {
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
import { ReferenceResolver, GenerateStyle } from '../config'
import createDebug from 'debug'
import { ContentBuilder } from '../builder'
import { escapeText, escapeTextForTable } from '../utils'

const debug = createDebug('api-docs-gen:processor:utils')

export function buildFunctionContent(
  style: GenerateStyle,
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver,
  builder: ContentBuilder,
  item: ApiItem,
  customTags: string[],
  base = 2
): void {
  builder.pushline(`${'#'.repeat(base)} ${item.displayName}`)
  builder.newline()

  const itemDeclared = item as ApiDeclaredItem
  const docs = itemDeclared.tsdocComment
  if (!docs) {
    return
  }

  // summary
  if (docs.summarySection) {
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.summarySection,
        item,
        style,
        resolver,
        customTags
      )
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

  // type params
  if (docs.typeParams && docs.typeParams.count > 0) {
    builder.pushline(`**Type parameters**`)
    builder.newline()
    builder.pushline(`| Parameter | Description |`)
    builder.pushline(`| --- | --- |`)
    for (const p of docs.typeParams.blocks) {
      builder.pushline(
        `| ${p.parameterName} | ${
          p.content
            ? getDocSectionContent(
                model,
                pkg,
                // @ts-ignore TODO:
                p.content,
                item,
                style,
                resolver,
                customTags
              )
            : ''
        } |`
      )
    }
    builder.newline()
  }

  // parameters
  const itemParam = item as ApiParameterListMixin
  if (itemParam.parameters) {
    builder.pushline(`${'#'.repeat(base + 1)} Parameters`)
    builder.newline()
    builder.pushline(`| Parameter | Type | Description |`)
    builder.pushline(`| --- | --- | --- |`)
    for (const p of itemParam.parameters) {
      builder.pushline(
        `| ${p.name} | ${escapeTextForTable(
          p.parameterTypeExcerpt.text.trim()
        )} | ${
          p.tsdocParamBlock && p.tsdocParamBlock.content
            ? getDocSectionContent(
                model,
                pkg,
                // @ts-ignore TODO:
                p.tsdocParamBlock.content,
                item,
                style,
                resolver,
                customTags
              )
            : ''
        } |`
      )
    }
    builder.newline()
  }

  // returns
  if (docs.returnsBlock) {
    builder.pushline(`${'#'.repeat(base + 1)} Returns`)
    builder.newline()
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.returnsBlock.content,
        item,
        style,
        resolver,
        customTags
      )
    )
    builder.newline()
  }

  // throws
  // @ts-ignore TODO:
  const throws = findCustomTags(docs.customBlocks, '@throws')
  if (throws.length > 0) {
    builder.pushline(`${'#'.repeat(base + 1)} Throws`)
    builder.newline()
    for (const t of throws) {
      let text = `${getDocSectionContent(
        model,
        pkg,
        t.content,
        item,
        style,
        resolver,
        customTags
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
    builder.pushline(`${'#'.repeat(base + 1)} Remarks`)
    builder.newline()
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.remarksBlock.content,
        item,
        style,
        resolver,
        customTags
      )
    )
    builder.newline()
  }

  // examples
  // @ts-ignore TODO:
  const examples = findCustomTags(docs.customBlocks, '@example')
  if (examples.length > 0) {
    builder.pushline(`${'#'.repeat(base + 1)} Examples`)
    builder.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        builder.pushline(`${'#'.repeat(base + 2)} Example ${count}`)
      }
      builder.pushline(
        `${getDocSectionContent(
          model,
          pkg,
          e.content,
          item,
          style,
          resolver,
          customTags
        )}`
      )
      count++
    }
  }
}

export function buildEnumContent(
  style: GenerateStyle,
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver,
  builder: ContentBuilder,
  item: ApiItem,
  customTags: string[],
  base = 2
): void {
  builder.pushline(`${'#'.repeat(base)} ${item.displayName}`)
  builder.newline()

  const itemDeclared = item as ApiDeclaredItem
  const docs = itemDeclared.tsdocComment
  if (!docs) {
    return
  }

  // summary
  if (docs.summarySection) {
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.summarySection,
        item,
        style,
        resolver,
        customTags
      )
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
    builder.pushline(`${'#'.repeat(base + 1)} Members`)
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
                resolver,
                customTags
              )
            : ''
        } |`
      )
    }
    builder.newline()
  }

  // remarks
  if (docs.remarksBlock) {
    builder.pushline(`${'#'.repeat(base + 1)} Remarks`)
    builder.newline()
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.remarksBlock.content,
        item,
        style,
        resolver,
        customTags
      )
    )
    builder.newline()
  }

  // examples
  // @ts-ignore TODO:
  const examples = findCustomTags(docs.customBlocks, '@example')
  if (examples.length > 0) {
    builder.pushline(`${'#'.repeat(base + 1)} Examples`)
    builder.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        builder.pushline(`${'#'.repeat(base + 1)} Example ${count}`)
      }
      builder.pushline(
        `${getDocSectionContent(
          model,
          pkg,
          e.content,
          item,
          style,
          resolver,
          customTags
        )}`
      )
      count++
    }
  }
}

type ClassinzableType =
  | 'constructor'
  | 'method'
  | 'property'
  | 'function'
  | 'interface'
  | 'class'

export function buildContentForClassinizable(
  style: GenerateStyle,
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver,
  builder: ContentBuilder,
  item: ApiItem,
  type: ClassinzableType,
  customTags: string[],
  base = 3
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
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.summarySection,
        item,
        style,
        resolver
      )
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

  // type params
  if (docs.typeParams && docs.typeParams.count > 0) {
    builder.pushline(`**Type parameters**`)
    builder.newline()
    builder.pushline(`| Parameter | Description |`)
    builder.pushline(`| --- | --- |`)
    for (const p of docs.typeParams.blocks) {
      builder.pushline(
        `| ${p.parameterName} | ${
          p.content
            ? getDocSectionContent(
                model,
                pkg,
                // @ts-ignore TODO:
                p.content,
                item,
                style,
                resolver,
                customTags
              )
            : ''
        } |`
      )
    }
    builder.newline()
  }

  // parameters
  const itemParam = item as ApiParameterListMixin
  if (
    (type === 'constructor' || type === 'method' || type === 'function') &&
    itemParam.parameters
  ) {
    builder.pushline(`*Parameters*`)
    builder.newline()
    builder.pushline(`| Parameter | Type | Description |`)
    builder.pushline(`| --- | --- | --- |`)
    for (const p of itemParam.parameters) {
      builder.pushline(
        `| ${p.name} | ${escapeTextForTable(
          p.parameterTypeExcerpt.text.trim()
        )} | ${
          p.tsdocParamBlock && p.tsdocParamBlock.content
            ? getDocSectionContent(
                model,
                pkg,
                // @ts-ignore TODO:
                p.tsdocParamBlock.content,
                item,
                style,
                resolver,
                customTags
              )
            : ''
        } |`
      )
    }
    builder.newline()
  }

  // returns
  if ((type === 'method' || type === 'function') && docs.returnsBlock) {
    builder.pushline(`${'#'.repeat(base)} Returns`)
    builder.newline()
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.returnsBlock.content,
        item,
        style,
        resolver,
        customTags
      )
    )
    builder.newline()
  }

  // throws
  // @ts-ignore TODO:
  const throws = findCustomTags(docs.customBlocks, '@throws')
  if (
    (type === 'constructor' || type === 'method' || type === 'function') &&
    throws.length > 0
  ) {
    builder.pushline(`${'#'.repeat(base)} Throws`)
    builder.newline()
    for (const t of throws) {
      let text = `${getDocSectionContent(
        model,
        pkg,
        t.content,
        item,
        style,
        resolver,
        customTags
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
    builder.pushline(`${'#'.repeat(base)} Remarks`)
    builder.newline()
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.remarksBlock.content,
        item,
        style,
        resolver,
        customTags
      )
    )
    builder.newline()
  }

  // examples
  // @ts-ignore TODO:
  const examples = findCustomTags(docs.customBlocks, '@example')
  if (examples.length > 0) {
    builder.pushline(`${'#'.repeat(base)} Examples`)
    builder.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        builder.pushline(`${'#'.repeat(base + 1)} Example ${count}`)
      }
      builder.pushline(
        `${getDocSectionContent(
          model,
          pkg,
          e.content,
          item,
          style,
          resolver,
          customTags
        )}`
      )
      count++
    }
  }
}

export function buildInterfaceContent(
  style: GenerateStyle,
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver,
  builder: ContentBuilder,
  item: ApiItem,
  customTags: string[],
  base = 2
): void {
  builder.pushline(`${'#'.repeat(base)} ${item.displayName}`)
  builder.newline()
  buildContentForClassinizable(
    style,
    model,
    pkg,
    resolver,
    builder,
    item,
    'interface',
    customTags,
    base + 1
  )
  builder.newline()

  const functions = item.members.filter(m => m.kind === 'CallSignature')
  if (functions.length) {
    builder.pushline(`${'#'.repeat(base + 1)} Functions`)
    builder.newline()
    for (const func of functions) {
      const itemDeclared = func as ApiDeclaredItem
      const display = itemDeclared.excerptTokens
        .map(token => token.text)
        .join('')
      builder.pushline(`${'#'.repeat(base + 2)} ${escapeTextForTable(display)}`)
      builder.newline()
      buildContentForClassinizable(
        style,
        model,
        pkg,
        resolver,
        builder,
        func,
        'function',
        customTags,
        base + 1
      )
    }
    builder.newline()
  }

  const methods = item.members.filter(m => m.kind === 'MethodSignature')
  if (methods.length) {
    builder.pushline(`${'#'.repeat(base + 1)} Methods`)
    builder.newline()
    for (const method of methods) {
      builder.pushline(`${'#'.repeat(base + 2)} ${method.displayName}`)
      builder.newline()
      buildContentForClassinizable(
        style,
        model,
        pkg,
        resolver,
        builder,
        method,
        'method',
        customTags,
        base + 1
      )
    }
    builder.newline()
  }

  const properties = item.members.filter(m => m.kind === 'PropertySignature')
  if (properties.length) {
    builder.pushline(`${'#'.repeat(base + 1)} Properties`)
    builder.newline()
    for (const property of properties) {
      builder.pushline(`${'#'.repeat(base + 2)} ${property.displayName}`)
      builder.newline()
      buildContentForClassinizable(
        style,
        model,
        pkg,
        resolver,
        builder,
        property,
        'property',
        customTags,
        base + 1
      )
    }
    builder.newline()
  }
}

export function buildClassContent(
  style: GenerateStyle,
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver,
  builder: ContentBuilder,
  item: ApiItem,
  customTags: string[],
  base = 2
): void {
  builder.pushline(`${'#'.repeat(base)} ${item.displayName}`)
  builder.newline()
  buildContentForClassinizable(
    style,
    model,
    pkg,
    resolver,
    builder,
    item,
    'class',
    customTags
  )
  builder.newline()

  const [ctor] = item.members.filter(m => m.kind === 'Constructor')
  builder.pushline(`${'#'.repeat(base + 1)} Constructor`)
  builder.newline()
  buildContentForClassinizable(
    style,
    model,
    pkg,
    resolver,
    builder,
    ctor,
    'constructor',
    customTags,
    base + 1
  )
  builder.newline()

  const methods = item.members.filter(m => m.kind === 'Method')
  if (methods.length) {
    builder.pushline(`${'#'.repeat(base + 1)} Methods`)
    builder.newline()
    for (const method of methods) {
      builder.pushline(`${'#'.repeat(base + 2)} ${method.displayName}`)
      builder.newline()
      buildContentForClassinizable(
        style,
        model,
        pkg,
        resolver,
        builder,
        method,
        'method',
        customTags,
        base + 1
      )
    }
    builder.newline()
  }

  const properties = item.members.filter(m => m.kind === 'Property')
  if (properties.length) {
    builder.pushline(`${'#'.repeat(base + 1)} Properties`)
    builder.newline()
    for (const property of properties) {
      builder.pushline(`${'#'.repeat(base + 2)} ${property.displayName}`)
      builder.newline()
      buildContentForClassinizable(
        style,
        model,
        pkg,
        resolver,
        builder,
        property,
        'property',
        customTags,
        base + 1
      )
    }
    builder.newline()
  }
}

export function buildTypeAliasContent(
  style: GenerateStyle,
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver,
  builder: ContentBuilder,
  item: ApiItem,
  customTags: string[],
  base = 2
): void {
  builder.pushline(`${'#'.repeat(base)} ${item.displayName}`)
  builder.newline()

  const itemDeclared = item as ApiDeclaredItem
  const docs = itemDeclared.tsdocComment
  if (!docs) {
    return
  }

  // summary
  if (docs.summarySection) {
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.summarySection,
        item,
        style,
        resolver,
        customTags
      )
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

  // type params
  if (docs.typeParams && docs.typeParams.count > 0) {
    builder.pushline(`**Type parameters**`)
    builder.newline()
    builder.pushline(`| Parameter | Description |`)
    builder.pushline(`| --- | --- |`)
    for (const p of docs.typeParams.blocks) {
      builder.pushline(
        `| ${p.parameterName} | ${
          p.content
            ? getDocSectionContent(
                model,
                pkg,
                // @ts-ignore TODO:
                p.content,
                item,
                style,
                resolver,
                customTags
              )
            : ''
        } |`
      )
    }
    builder.newline()
  }

  // remarks
  if (docs.remarksBlock) {
    builder.pushline(`${'#'.repeat(base + 1)} Remarks`)
    builder.newline()
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.remarksBlock.content,
        item,
        style,
        resolver,
        customTags
      )
    )
    builder.newline()
  }

  // examples
  // @ts-ignore TODO:
  const examples = findCustomTags(docs.customBlocks, '@example')
  if (examples.length > 0) {
    builder.pushline(`${'#'.repeat(base) + 1} Examples`)
    builder.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        builder.pushline(`${'#'.repeat(base + 2)} Example ${count}`)
      }
      builder.pushline(
        `${getDocSectionContent(
          model,
          pkg,
          e.content,
          item,
          style,
          resolver,
          customTags
        )}`
      )
      count++
    }
  }
}

export function buildVariableContent(
  style: GenerateStyle,
  model: ApiModel,
  pkg: ApiPackage,
  resolver: ReferenceResolver,
  builder: ContentBuilder,
  item: ApiItem,
  customTags: string[],
  base = 2
): void {
  builder.pushline(`${'#'.repeat(base)} ${item.displayName}`)
  builder.newline()

  const itemDeclared = item as ApiDeclaredItem
  const docs = itemDeclared.tsdocComment
  if (!docs) {
    return
  }

  // summary
  if (docs.summarySection) {
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.summarySection,
        item,
        style,
        resolver,
        customTags
      )
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
    builder.pushline(`${'#'.repeat(base + 1)} Remarks`)
    builder.newline()
    builder.pushline(
      getDocSectionContent(
        model,
        pkg,
        // @ts-ignore TODO:
        docs.remarksBlock.content,
        item,
        style,
        resolver,
        customTags
      )
    )
    builder.newline()
  }

  // examples
  // @ts-ignore TODO:
  const examples = findCustomTags(docs.customBlocks, '@example')
  if (examples.length > 0) {
    builder.pushline(`${'#'.repeat(base + 1)} Examples`)
    builder.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        builder.pushline(`${'#'.repeat(base + 2)} Example ${count}`)
      }
      builder.pushline(
        `${getDocSectionContent(
          model,
          pkg,
          e.content,
          item,
          style,
          resolver,
          customTags
        )}`
      )
      count++
    }
  }
}

/**
 * Get DocSection content
 *
 * @param model - a {@link https://rushstack.io/pages/api/api-extractor-model.apimodel/ | model}
 * @param pkg - a {@link https://rushstack.io/pages/api/api-extractor-model.apipackage/ | package}
 * @param content - a {@link https://github.com/microsoft/tsdoc/blob/master/tsdoc/src/nodes/DocSection.ts | content}
 * @param contextItem - a context {@link https://rushstack.io/pages/api/api-extractor-model.apiitem/ | item}
 * @param style - generate style, See the {@link GenerateStyle}
 * @param resolver - {@link ReferenceResolver | resolver} to resolve markdown content references
 *
 * @returns doc section markdown content
 *
 * @public
 */
export function getDocSectionContent(
  model: ApiModel,
  pkg: ApiPackage,
  content: DocSection,
  contextItem: ApiItem,
  style: GenerateStyle,
  resolver: ReferenceResolver,
  customTags: string[] // eslint-disable-line @typescript-eslint/no-unused-vars
): string {
  let ret = ''
  let paragraphBreak = false

  for (const n of content.nodes) {
    if (n.kind === DocNodeKind.Paragraph) {
      if (!paragraphBreak) {
        paragraphBreak = true
      } else {
        ret += `\n\n`
      }
      for (const nn of n.getChildNodes()) {
        if (nn.kind === DocNodeKind.PlainText) {
          ret += (nn as unknown as DocPlainText).text
        } else if (nn.kind === DocNodeKind.CodeSpan) {
          ret += `\`${(nn as unknown as DocCodeSpan).code}\``
        } else if (nn.kind === DocNodeKind.LinkTag) {
          const { linkText, urlDestination, codeDestination } =
            nn as unknown as IDocLinkTagParameters
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
                pkg,
                customTags
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
      const fenced = n as unknown as DocFencedCode
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

/**
 * Find custom tags
 *
 * @remarks
 * About custom tags, See the {@link https://github.com/microsoft/tsdoc/issues/21 | this issue}
 *
 * @param customBlocks - target cusotm blocks
 * @param tag - finding target tag
 *
 * @returns found custom blocks
 *
 * @public
 */
export function findCustomTags(
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

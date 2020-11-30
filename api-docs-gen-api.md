# api-docs-gen API References

## Table Of Contents

- [Interface](#interface)
  - [Config](#config)
  - [ContentBuilder](#contentbuilder)
  - [ContentBuilderOptions](#contentbuilderoptions)
  - [GenerateOptions](#generateoptions)
  - [MarkdownContent](#markdowncontent)
- [Function](#function)
  - [createContentBuilder](#createcontentbuilder)
  - [escapeText](#escapetext)
  - [escapeTextForTable](#escapetextfortable)
  - [findCustomTags](#findcustomtags)
  - [generate](#generate)
  - [getDocSectionContent](#getdocsectioncontent)
  - [getSafePathFromDisplayName](#getsafepathfromdisplayname)
  - [multiProcessor](#multiprocessor)
  - [multiResolver](#multiresolver)
  - [tocProcessor](#tocprocessor)
  - [tocResolver](#tocresolver)
- [Variable](#variable)
  - [DefaultConfig](#defaultconfig)
- [Enum](#enum)
  - [GenerateStyle](#generatestyle)
- [TypeAlias](#typealias)
  - [MarkdownProcessor](#markdownprocessor)
  - [ReferenceResolver](#referenceresolver)

## Interface

### Config

Configuration

**Signature:**
```typescript
export interface Config 
```


#### Methods


#### Properties

##### linkReferencer

markdown link reference [resolver](#referenceresolver)

**Signature:**
```typescript
linkReferencer?: ReferenceResolver;
```

##### processor

markdown docs [processor](#markdownprocessor)

**Signature:**
```typescript
processor: MarkdownProcessor;
```


### ContentBuilder

Content Builder

**Signature:**
```typescript
export interface ContentBuilder 
```


#### Methods

##### deindent

DeIndent content

**Signature:**
```typescript
deindent(withoutNewLine?: boolean): void;
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |
| withoutNewLine | boolean | whether deindent to be added without new line |

##### indent

Indent content

**Signature:**
```typescript
indent(withoutNewLine?: boolean): void;
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |
| withoutNewLine | boolean |  |

##### newline

Add line break

**Signature:**
```typescript
newline(): void;
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |

##### push

Add content

**Signature:**
```typescript
push(content: string): void;
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |
| content | string | additional content |

##### pushline

Add content with line break

**Signature:**
```typescript
pushline(content: string): void;
```

*Parameters*

| Parameter | Type | Description |
| --- | --- | --- |
| content | string | additional content |


#### Properties

##### content

Content

**Signature:**
```typescript
readonly content: string;
```

##### indentLevel

Indent level

**Signature:**
```typescript
readonly indentLevel: number;
```


### ContentBuilderOptions

Content Builder options

**Signature:**
```typescript
export interface ContentBuilderOptions 
```

#### Remarks

options that creating a [ContentBuilder](#contentbuilder)


#### Methods


#### Properties

##### indentLevel

Intdent level of Builder

**Signature:**
```typescript
indentLevel?: number;
```


### GenerateOptions

Generate Options for Generate API

**Signature:**
```typescript
export interface GenerateOptions 
```


#### Methods


#### Properties

##### config

configration

**Signature:**
```typescript
config: Config;
```

#### Remarks

see the [Config](#config)

##### done

generate done callback

**Signature:**
```typescript
done?: (pkgname: string, filename: string) => void;
```

#### Remarks

The callback that will be called when the generate process is finished.

##### errorOnTSDocConfig

TSDoc configration error callback

**Signature:**
```typescript
errorOnTSDocConfig?: (error: string) => void;
```

#### Remarks

The callback occurs if you have an error in configration when `--tsdoc-config` is specified

##### style

generate style

**Signature:**
```typescript
style: GenerateStyle;
```

#### Remarks

see the [GenerateStyle](#generatestyle)

##### tsdocConfigPath

TSDoc configration path

**Signature:**
```typescript
tsdocConfigPath?: string;
```

#### Remarks

Optional, see the [here](https://github.com/microsoft/tsdoc/tree/master/tsdoc-config)


### MarkdownContent

Markdown content

**Signature:**
```typescript
export interface MarkdownContent 
```


#### Methods


#### Properties

##### body

mkarkdown content

**Signature:**
```typescript
body: string;
```

##### filename

markdown filename

**Signature:**
```typescript
filename: string;
```



## Function

### createContentBuilder

Create a Content Builder

**Signature:**
```typescript
export declare function createContentBuilder(options?: ContentBuilderOptions): ContentBuilder;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| options | ContentBuilderOptions | Content Builder options |

#### Returns

 A [ContentBuilder](#contentbuilder) instance

### escapeText

Escape text for markdown

**Signature:**
```typescript
export declare function escapeText(text: string): string;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| text | string | the target text |

#### Returns

 escaped text

### escapeTextForTable

Escape text for markdown table

**Signature:**
```typescript
export declare function escapeTextForTable(text: string): string;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| text | string | the target text |

#### Returns

 escaped text

### findCustomTags

Find custom tags

**Signature:**
```typescript
export declare function findCustomTags(customBlocks: readonly DocBlock[], tag: string): DocBlock[];
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| customBlocks | readonly DocBlock[] | target cusotm blocks |
| tag | string | finding target tag |

#### Returns

 found custom blocks

#### Remarks

About custom tags, See the [this issue](https://github.com/microsoft/tsdoc/issues/21)

### generate

Generate API docs

**Signature:**
```typescript
export declare function generate(input: string[], output: string, options: GenerateOptions): Promise<void>;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| input | string[] | input paths |
| output | string | output api docs full path |
| options | GenerateOptions | optiosn for generate, see the [GenerateOptions](#generateoptions) |

### getDocSectionContent

Get DocSection content

**Signature:**
```typescript
export declare function getDocSectionContent(model: ApiModel, pkg: ApiPackage, content: DocSection, contextItem: ApiItem, style: GenerateStyle, resolver: ReferenceResolver, customTags: string[]): string;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| model | ApiModel | a [model](https://rushstack.io/pages/api/api-extractor-model.apimodel/) |
| pkg | ApiPackage | a [package](https://rushstack.io/pages/api/api-extractor-model.apipackage/) |
| content | DocSection | a [content](https://github.com/microsoft/tsdoc/blob/master/tsdoc/src/nodes/DocSection.ts) |
| contextItem | ApiItem | a context [item](https://rushstack.io/pages/api/api-extractor-model.apiitem/) |
| style | GenerateStyle | generate style, See the [GenerateStyle](#generatestyle) |
| resolver | ReferenceResolver | [resolver](#referenceresolver) to resolve markdown content references |
| customTags | string[] |  |

#### Returns

 doc section markdown content

### getSafePathFromDisplayName

Get safe path from display name of [ApiItem](https://rushstack.io/pages/api/api-extractor-model.apiitem/)

**Signature:**
```typescript
export declare function getSafePathFromDisplayName(name: string): string;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| name | string | the target displayname |

#### Returns

 safe path

### multiProcessor

Process of API doc model

**Signature:**
```typescript
export declare function process(model: ApiModel, pkg: ApiPackage, style: GenerateStyle, resolver: ReferenceResolver, customTags?: string[]): string | MarkdownContent[];
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| model | ApiModel | a [model](https://rushstack.io/pages/api/api-extractor-model.apimodel/) |
| pkg | ApiPackage | a [package](https://rushstack.io/pages/api/api-extractor-model.apipackage/) |
| style | GenerateStyle | generate style, See the [GenerateStyle](#generatestyle) |
| resolver | ReferenceResolver | [resolver](#referenceresolver) to resolve markdown content references |
| customTags | string[] | TSDoc custom tags. This parameter is set to an array of custom tag names defined in `--tsdoc-config`. |

#### Returns

 markdown content strign or Array of [MarkdownContent](#markdowncontent)

#### Remarks

Generate the markdown contents the bellow:
```
- Function
- Enum
- Interface
- Class
- Variable
- TypeAlias
```



### multiResolver

Resolve the markdown content reference

**Signature:**
```typescript
export declare function resolve(style: GenerateStyle, item: ApiItem, model: ApiModel, pkg: ApiPackage, customTags?: string[]): string;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| style | GenerateStyle | generate style, See the [GenerateStyle](#generatestyle) |
| item | ApiItem | a [item](https://rushstack.io/pages/api/api-extractor-model.apiitem/) |
| model | ApiModel | a [model](https://rushstack.io/pages/api/api-extractor-model.apimodel/) |
| pkg | ApiPackage | a [package](https://rushstack.io/pages/api/api-extractor-model.apipackage/) |
| customTags | string[] | TSDoc custom tags. This parameter is set to an array of custom tag names defined in `--tsdoc-config`. |

#### Returns

 resolved the reference string

#### Remarks

This reference resolver is used by the [processor](#multiprocessor) to generate API docs references for separate pieces of markdown content.

### tocProcessor

Process of API doc model

**Signature:**
```typescript
export declare function process(model: ApiModel, pkg: ApiPackage, style: GenerateStyle, resolver: ReferenceResolver, customTags?: string[]): string | MarkdownContent[];
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| model | ApiModel | a [model](https://rushstack.io/pages/api/api-extractor-model.apimodel/) |
| pkg | ApiPackage | a [package](https://rushstack.io/pages/api/api-extractor-model.apipackage/) |
| style | GenerateStyle | generate style, See the [GenerateStyle](#generatestyle) |
| resolver | ReferenceResolver | [resolver](#referenceresolver) to resolve markdown content references |
| customTags | string[] | TSDoc custom tags. This parameter is set to an array of custom tag names defined in `--tsdoc-config`. |

#### Returns

 markdown string content that have TOC

#### Remarks

Generate the markdown contents that have TOC. About API doc model, see the [doc model structure](https://api-extractor.com/pages/overview/demo_docs/), and [doc model API](https://github.com/microsoft/rushstack/tree/master/apps/api-extractor-model). In about generate api docs, see the [api-docs-gen API References](https://github.com/kazupon/api-docs-gen/blob/master/api-docs-gen-api.md)

### tocResolver

Resolve the markdown content reference

**Signature:**
```typescript
export declare function resolve(style: GenerateStyle, item: ApiItem, model: ApiModel, pkg: ApiPackage, customTags?: string[]): string;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| style | GenerateStyle | generate style, See the [GenerateStyle](#generatestyle) |
| item | ApiItem | a [item](https://rushstack.io/pages/api/api-extractor-model.apiitem/) |
| model | ApiModel | a [model](https://rushstack.io/pages/api/api-extractor-model.apimodel/) |
| pkg | ApiPackage | a [package](https://rushstack.io/pages/api/api-extractor-model.apipackage/) |
| customTags | string[] | TSDoc custom tags. This parameter is set to an array of custom tag names defined in `--tsdoc-config`. |

#### Returns

 resolved the reference string

#### Remarks

This reference resolver is used by the [processor](#tocprocessor) to generate a reference specifically for API docs of markdown content with TOC.


## Variable

### DefaultConfig

Default Configration

**Signature:**
```typescript
DefaultConfig: Config
```

#### Remarks

Default config for the CLI


## Enum

### GenerateStyle

The generate style

**Signature:**
```typescript
export declare const enum GenerateStyle 
```

#### Members

| Member | Value| Description |
| --- | --- | --- |
| Directory | "directory" | Output api docs files for each package |
| NoPrefix | "noprefix" | No Prefix the output api docs file name |
| Prefix | "prefix" | Prefix the output api docs file name with package name |

#### Remarks

The value of this constants is the same as that taken from `--genereate-style` option.


## TypeAlias

### MarkdownProcessor

Markdown docs processor

**Signature:**
```typescript
export declare type MarkdownProcessor = (model: ApiModel, pkg: ApiPackage, style: GenerateStyle, resolver: ReferenceResolver, customTags?: string[]) => string | MarkdownContent[];
```

### ReferenceResolver

Markdown reference resolver

**Signature:**
```typescript
export declare type ReferenceResolver = (style: GenerateStyle, item: ApiItem, model: ApiModel, pkg: ApiPackage, customTags?: string[]) => string;
```



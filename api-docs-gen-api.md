# api-docs-gen API References

## Table Of Contents

- [Interface](#interface)
  - [Config](#config)
  - [ContentBuilder](#contentbuilder)
  - [ContentBuilderOptions](#contentbuilderoptions)
  - [MarkdownContent](#markdowncontent)
- [Function](#function)
  - [createContentBuilder](#createcontentbuilder)
  - [escapeText](#escapetext)
  - [generate](#generate)
  - [getCustomTags](#getcustomtags)
  - [getDocSectionContent](#getdocsectioncontent)
  - [getSafePathFromDisplayName](#getsafepathfromdisplayname)
  - [multiProcessor](#multiprocessor)
  - [multiResolver](#multiresolver)
  - [resolveConfig](#resolveconfig)
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

markdown link reference resolver

**Signature:**
```typescript
linkReferencer?: ReferenceResolver;
```

##### processor

markdown docs processor

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

Indent level   0

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
| options | ContentBuilderOptions | Content Builder options A [ContentBuilder](#contentbuilder) instance |

### escapeText

escape text

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

### generate

generate markdown contents

**Signature:**
```typescript
export declare function generate(input: string[], output: string, style: GenerateStyle, config: Config, callback?: (pkgname: string, filename: string) => void): Promise<void>;
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| input | string[] | input paths |
| output | string | output full path |
| style | GenerateStyle | generate style, see [GenerateStyle](#generatestyle) |
| config | Config | configration, see [Config](#config) |
| callback | (pkgname: string, filename: string) => void |  |

### getCustomTags

### getDocSectionContent

### getSafePathFromDisplayName

get safe path from display name of ApiItem

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

### multiResolver

### resolveConfig

### tocProcessor

### tocResolver


## Variable

### DefaultConfig

Default Config

**Signature:**
```typescript
DefaultConfig: Config
```


## Enum

### GenerateStyle

Constant of `--genereate-style` option

**Signature:**
```typescript
export declare const enum GenerateStyle 
```

#### Members

| Member | Value| Description |
| --- | --- | --- |
| Directory | "directory" |  |
| Prefix | "prefix" |  |


## TypeAlias

### MarkdownProcessor

Markdown docs processor

**Signature:**
```typescript
export declare type MarkdownProcessor = (model: ApiModel, pkg: ApiPackage, style: GenerateStyle, resolver: ReferenceResolver) => string | MarkdownContent[];
```

### ReferenceResolver

Markdown reference resolver

**Signature:**
```typescript
export declare type ReferenceResolver = (style: GenerateStyle, item: ApiItem, model: ApiModel, pkg: ApiPackage) => string;
```



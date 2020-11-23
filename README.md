# :book: api-docs-gen

![Test](https://github.com/kazupon/api-docs-gen/workflows/Test/badge.svg)
[![npm](https://img.shields.io/npm/v/api-docs-gen.svg)](https://www.npmjs.com/package/api-docs-gen)

API Documentation generator from `api-extractor` doc model


## :hammer: Requirement

You need to generate **doc model** with using [`api-extractor`](https://api-extractor.com/)


## :cd: Installation

### npm

```sh
$ npm install -g api-docs-gen
```

### yarn
```sh
yarn global api-docs-gen
```


## :rocket: Usage

### CLI
```
Usage
  $ api-docs-gen <package1.api.json> <package2.api.json> ...

Options
  --config, -c              configration file
  --output, -o              output dierectory that is markdown contents
  --generate-style, -g      document generating style, default 'prefix'
                            'prefix': be able to separated with each package name
                            'directory': be able to separated with each package directory
  --tsdoc-config, -t        tsdoc configration file
```


### API
```javascript
const path = require('path')
const { genereate, DefaultConfig } = require('api-docs-gen')

// input
const input = [path.resolve(process.cwd(), './package1.api.json')]

// output
const output = path.resolve(process.cwd(), './docs')

// generate API docs with prefixed package name
await generate(input, output, { style: 'prefix', config: DefaultConfig })
```

About details, See the [API References](https://github.com/kazupon/api-docs-gen/blob/master/api-docs-gen-api.md)


## :lollipop: Examples
You can play API docs generation that have [multi packages](https://github.com/kazupon/api-docs-gen/tree/master/examples/packages).

You can play with the following command:

```sh
$ yarn example:setup # module installing on each package

$ yarn example:build # build on each package

$ yarn example:extract # generate doc model with `api-extractor` on each package

$ yarn example:gen # genearte API docs with `api-docs-gen`

$ yarn example:docs # run vuepress
```

## :bookmark: TSDoc custom tags

`api-docs-gen` allows TSDoc custom tags to be processed using [tsdoc-config](https://github.com/microsoft/tsdoc/tree/master/tsdoc-config).

You can make it work from the `api-extractor` model by specifying tsdoc configration in the `--tsdoc-config` option as follows:

```bash
$ api-docs-gen package1.api.json --tsdoc-config ./tsdoc.json
```

If you want to output custom tags comment to markdown, you need to implement and configure the custom `MarkdownProcessor`.

For the `MarkdownProcessor`, see the [API References](https://github.com/kazupon/api-docs-gen/blob/master/api-docs-gen-api.md).

See how to configure it in the following configration.

## :wrench: Configration
You can fully customize the generation of api docs using the config offered by `api-docs-gen`.

Here is the schema (typescript type definition) of the config:
```typescript
// There are two things you need to specify in config
export interface Config {
  // A resolver that resolves references to links in markdown content
  linkReferencer?: ReferenceResolver
  // A processor that generates markdown content
  processor: MarkdownProcessor
}
```

You can generate customized api docs by specifying these as you define them in your config,  and the CLI `--config` option. `api-docs-gen` CLI  will read `docsgen.config.js` as default.

api-docs-gen API docs is a TOC included markdown document. To generate the API docs, it use a customized resolver and processor for TOC.

- Configration: https://github.com/kazupon/api-docs-gen/blob/master/docsgen.config.js
- TOC reolsver: https://github.com/kazupon/api-docs-gen/blob/master/src/resolver/toc.ts
- TOC processor: https://github.com/kazupon/api-docs-gen/blob/master/src/processor/toc.ts

If you want to customize your api docs, these will be helpful.

It's recommended to refer to the [API References](https://github.com/kazupon/api-docs-gen/blob/master/api-docs-gen-api.md) for customization.


## :scroll: Changelog
Details changes for each release are documented in the [CHANGELOG.md](https://github.com/kazupon/api-docs-gen/blob/master/CHANGELOG.md).


## :exclamation: Issues
Please make sure to read the [Issue Reporting Checklist](https://github.com/kazupon/api-docs-gen/blob/master/.github/CONTRIBUTING.md#issue-reporting-guidelines) before opening an issue. Issues not conforming to the guidelines may be closed immediately.

## :white_check_mark: TODO
Managed with [GitHub Projects](https://github.com/kazupon/api-docs-gen/projects/2)

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)

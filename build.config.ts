import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true
  },
  outDir: 'lib',
  entries: ['src/index', 'src/cli']
})

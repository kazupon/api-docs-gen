const { getChildren } = require('../../scripts/utils')

const api = [
  {
    title: 'Libarary 1',
    collapsable: false,
    children: getChildren('library1')
  },
  {
    title: 'Utilities',
    collapsable: false,
    children: getChildren('utilities')
  }
]

module.exports = {
  title: 'Example API References',
  description: 'Example API References',
  themeConfig: {
    sidebarDepth: 3,
    sidebar: {
      '/': api,
    }
  }
}

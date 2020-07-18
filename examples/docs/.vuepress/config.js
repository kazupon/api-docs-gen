const api = [
  {
    title: 'Libarary 1',
    collapsable: false,
    children: [
      '/api/library1-variable',
      '/api/library1-enum',
      '/api/library1-typealias',
      '/api/library1-function',
      '/api/library1-interface',
      '/api/library1-class'
    ]
  },
  {
    title: 'Utilities',
    collapsable: false,
    children: [
      '/api/utilities-variable',
    ]
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

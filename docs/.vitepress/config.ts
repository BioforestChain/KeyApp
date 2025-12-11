import { defineConfig } from 'vitepress'
import { webappLoaderPlugin } from './plugins/webapp-loader'

const GITHUB_OWNER = 'BioforestChain'
const GITHUB_REPO = 'KeyApp'

/**
 * Base URL 配置
 * - 开发环境：使用 '/'
 * - GitHub Pages：使用 '/KeyApp/'（通过 CI 环境变量设置）
 * - 自定义部署：通过 VITEPRESS_BASE 环境变量设置
 *
 * 注意：VitePress 的 Vue Router 需要绝对路径 base，不能用 './'
 */
const base = process.env.VITEPRESS_BASE ?? '/'

export default defineConfig({
  title: 'BFM Pay',
  description: '多链钱包移动应用',
  base,

  // webapp/storybook 目录由 CI 动态生成，忽略死链接检查
  ignoreDeadLinks: [/\.\/webapp/, /\.\/webapp-beta/, /\.\/storybook/],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#667eea' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '下载', link: '/download' },
      { text: 'Storybook', link: './storybook/' },
      { text: '贡献指南', link: '/contributing' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/': [
        {
          text: '开始使用',
          items: [
            { text: '简介', link: '/' },
            { text: '下载安装', link: '/download' },
            { text: '更新日志', link: '/changelog' },
          ],
        },
        {
          text: '开发者',
          items: [
            { text: '贡献指南', link: '/contributing' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}` }],

    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${new Date().getFullYear()} BioforestChain`,
    },

    search: {
      provider: 'local',
    },
  },

  vite: {
    plugins: [webappLoaderPlugin()],
    server: {
      port: 5200,
    },
  },
})

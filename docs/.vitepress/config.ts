import { defineConfig } from 'vitepress'
import { webappLoaderPlugin } from './plugins/webapp-loader'

const GITHUB_OWNER = 'BioforestChain'
const GITHUB_REPO = 'KeyApp'

export default defineConfig({
  title: 'BFM Pay',
  description: '多链钱包移动应用',
  // 使用相对路径，支持部署在任意子路径下
  base: './',

  // webapp 目录由插件动态生成，忽略死链接检查
  ignoreDeadLinks: [/\.\/webapp/, /\.\/webapp-beta/],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#667eea' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: '首页', link: '/' },
      { text: '下载', link: '/download' },
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

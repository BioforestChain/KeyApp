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
      { text: '开发说明书', link: '/white-book/' },
      { text: 'Storybook', link: './storybook/' },
      { text: '贡献指南', link: '/contributing' },
      { text: '更新日志', link: '/changelog' },
    ],

    sidebar: {
      '/white-book/': [
        {
          text: '软件开发说明书',
          link: '/white-book/',
          items: [
            {
              text: '第一篇：产品篇',
              collapsed: false,
              items: [
                { text: '概述', link: '/white-book/01-产品篇/' },
                { text: '1.1 产品愿景', link: '/white-book/01-产品篇/01-产品愿景/' },
                { text: '1.2 用户画像', link: '/white-book/01-产品篇/02-用户画像/' },
                { text: '1.3 用户故事', link: '/white-book/01-产品篇/03-用户故事/' },
              ],
            },
            {
              text: '第二篇：设计篇',
              collapsed: false,
              items: [
                { text: '概述', link: '/white-book/02-设计篇/' },
                { text: '2.1 交互设计', link: '/white-book/02-设计篇/01-交互设计/' },
                { text: '2.2 视觉设计', link: '/white-book/02-设计篇/02-视觉设计/' },
                { text: '2.3 设计原则', link: '/white-book/02-设计篇/03-设计原则/' },
              ],
            },
            {
              text: '第三篇：架构篇',
              collapsed: false,
              items: [
                { text: '概述', link: '/white-book/03-架构篇/' },
                { text: '3.1 技术选型', link: '/white-book/03-架构篇/01-技术选型/' },
                { text: '3.2 系统架构', link: '/white-book/03-架构篇/02-系统架构/' },
                { text: '3.3 导航系统', link: '/white-book/03-架构篇/03-导航系统/' },
                { text: '3.4 状态管理', link: '/white-book/03-架构篇/04-状态管理/' },
              ],
            },
            {
              text: '第四篇：服务篇',
              collapsed: true,
              items: [
                { text: '概述', link: '/white-book/04-服务篇/' },
                { text: '4.1 服务架构', link: '/white-book/04-服务篇/01-服务架构/' },
                { text: '4.2 链服务接口', link: '/white-book/04-服务篇/02-链服务接口/' },
                { text: '4.3 平台服务', link: '/white-book/04-服务篇/03-平台服务/' },
                { text: '4.4 事件系统', link: '/white-book/04-服务篇/04-事件系统/' },
              ],
            },
            {
              text: '第五篇：组件篇',
              collapsed: true,
              items: [
                { text: '概述', link: '/white-book/05-组件篇/' },
                { text: '5.1 组件体系', link: '/white-book/05-组件篇/01-组件体系/' },
                { text: '5.2 表单系统', link: '/white-book/05-组件篇/02-表单系统/' },
                { text: '5.3 组件开发规范', link: '/white-book/05-组件篇/03-组件开发规范/' },
              ],
            },
            {
              text: '第六篇：安全篇',
              collapsed: true,
              items: [
                { text: '概述', link: '/white-book/06-安全篇/' },
                { text: '6.1 密钥管理', link: '/white-book/06-安全篇/01-密钥管理/' },
                { text: '6.2 身份认证', link: '/white-book/06-安全篇/02-身份认证/' },
                { text: '6.3 DWEB授权', link: '/white-book/06-安全篇/03-DWEB授权/' },
              ],
            },
            {
              text: '第七篇：国际化篇',
              collapsed: true,
              items: [
                { text: '概述', link: '/white-book/07-国际化篇/' },
                { text: '7.1 多语言支持', link: '/white-book/07-国际化篇/01-多语言支持/' },
                { text: '7.2 本地化规范', link: '/white-book/07-国际化篇/02-本地化规范/' },
              ],
            },
            {
              text: '第八篇：测试篇',
              collapsed: true,
              items: [
                { text: '概述', link: '/white-book/08-测试篇/' },
                { text: '8.1 测试策略', link: '/white-book/08-测试篇/01-测试策略/' },
                { text: '8.2 Vitest配置', link: '/white-book/08-测试篇/02-Vitest配置/' },
                { text: '8.3 Playwright配置', link: '/white-book/08-测试篇/03-Playwright配置/' },
              ],
            },
            {
              text: '第九篇：部署篇',
              collapsed: true,
              items: [
                { text: '概述', link: '/white-book/09-部署篇/' },
                { text: '9.1 构建配置', link: '/white-book/09-部署篇/01-构建配置/' },
                { text: '9.2 发布流程', link: '/white-book/09-部署篇/02-发布流程/' },
              ],
            },
            {
              text: '附录',
              collapsed: true,
              items: [
                { text: 'A. 术语表', link: '/white-book/附录/A-术语表/' },
                { text: 'B. 链网络列表', link: '/white-book/附录/B-链网络列表/' },
                { text: 'C. mpay迁移指南', link: '/white-book/附录/C-mpay迁移指南/' },
                { text: 'D. API参考', link: '/white-book/附录/D-API参考/' },
              ],
            },
          ],
        },
      ],
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
            { text: '软件开发说明书', link: '/white-book/' },
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

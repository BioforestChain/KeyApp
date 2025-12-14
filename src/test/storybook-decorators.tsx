import type { Decorator } from '@storybook/react'
import { I18nextProvider } from 'react-i18next'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  createMemoryHistory,
  Outlet,
} from '@tanstack/react-router'
import i18n from '@/i18n/index'

/**
 * Storybook Router Decorator
 * 为 Stories 提供 TanStack Router 上下文
 *
 * @param initialPath - 初始路由路径，默认为 '/'
 */
export function withRouter(initialPath: string = '/'): Decorator {
  return (Story) => {
    // 创建简单的路由配置，Story 在 root route 的 Outlet 中渲染
    const rootRoute = createRootRoute({
      component: () => (
        <>
          <Outlet />
          <Story />
        </>
      ),
    })

    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
    })

    const routeTree = rootRoute.addChildren([indexRoute])

    // 使用 memory history 避免影响浏览器 URL
    const memoryHistory = createMemoryHistory({
      initialEntries: [initialPath],
    })

    const router = createRouter({
      routeTree,
      history: memoryHistory,
    })

    return <RouterProvider router={router} />
  }
}

/**
 * Storybook i18n Decorator
 * 为 Stories 提供 i18next 上下文
 *
 * preview.tsx 已经提供了全局 i18n decorator，
 * 这个函数用于需要单独控制 i18n 的场景
 */
export function withI18n(): Decorator {
  return (Story) => (
    <I18nextProvider i18n={i18n}>
      <Story />
    </I18nextProvider>
  )
}

import { lazy } from 'react'
import { createRoute } from '@tanstack/react-router'
import type React from 'react'
import type { AnyRoute, RouteComponent } from '@tanstack/react-router'
import type { AddressAuthType } from '@/services/authorize'

type WithSuspense = (
  Component: React.LazyExoticComponent<React.ComponentType<{}>>
) => RouteComponent

function parseAddressAuthType(value: unknown): AddressAuthType | undefined {
  if (value === 'main' || value === 'network' || value === 'all') return value
  return undefined
}

export function createAuthorizeRoutes({
  rootRoute,
  withSuspense,
}: {
  rootRoute: AnyRoute
  withSuspense: WithSuspense
}) {
  const AddressAuthPage = lazy(() =>
    import('@/pages/authorize/address').then((m) => ({ default: m.AddressAuthPage }))
  )

  const SignatureAuthPage = lazy(() =>
    import('@/pages/authorize/signature').then((m) => ({ default: m.SignatureAuthPage }))
  )

  const authorizeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/authorize',
  })

  const authorizeAddressRoute = createRoute({
    getParentRoute: () => authorizeRoute,
    path: '/address/$id',
    component: withSuspense(AddressAuthPage),
    validateSearch: (search: Record<string, unknown>) => ({
      type: parseAddressAuthType(search.type) ?? 'main',
      chainName: typeof search.chainName === 'string' ? search.chainName : undefined,
      signMessage: typeof search.signMessage === 'string' ? search.signMessage : undefined,
      getMain:
        typeof search.getMain === 'string'
          ? search.getMain
          : typeof search.getMain === 'boolean'
            ? String(search.getMain)
            : undefined,
    }),
  })

  const authorizeSignatureRoute = createRoute({
    getParentRoute: () => authorizeRoute,
    path: '/signature/$id',
    component: withSuspense(SignatureAuthPage),
    validateSearch: (search: Record<string, unknown>) => ({
      signaturedata:
        typeof search.signaturedata === 'string'
          ? search.signaturedata
          : search.signaturedata !== null && typeof search.signaturedata === 'object'
            ? JSON.stringify(search.signaturedata)
            : undefined,
    }),
  })

  return {
    authorizeRoute: authorizeRoute.addChildren([authorizeAddressRoute, authorizeSignatureRoute]),
  }
}

'use client'
import * as React from 'react'
import { cn } from '@biochain/key-utils'
import type { KeyUIComponentProps, ComponentRenderFn } from './types'
import { EMPTY_OBJECT } from './constants'
import { useMergedRefs } from './use-merged-refs'

type IntrinsicTagName = keyof React.JSX.IntrinsicElements

function resolveClassName<State>(
  classNameProp: string | ((state: State) => string | undefined) | undefined,
  state: State,
): string | undefined {
  if (typeof classNameProp === 'function') {
    return classNameProp(state)
  }
  return classNameProp
}

function resolveStyle<State>(
  styleProp: React.CSSProperties | ((state: State) => React.CSSProperties | undefined) | undefined,
  state: State,
): React.CSSProperties | undefined {
  if (typeof styleProp === 'function') {
    return styleProp(state)
  }
  return styleProp
}

function getReactElementRef(element: React.ReactElement | undefined): React.Ref<any> | undefined {
  if (!element) return undefined
  return (element as any).ref
}

export interface UseRenderElementParameters<State, RenderedElementType extends Element> {
  enabled?: boolean
  ref?: React.Ref<RenderedElementType> | (React.Ref<RenderedElementType> | undefined)[]
  state?: State
  props?: React.HTMLAttributes<any> | ((props: React.HTMLAttributes<any>) => React.HTMLAttributes<any>)
  defaultClassName?: string
}

export interface UseRenderElementComponentProps<State> {
  className?: string | ((state: State) => string | undefined)
  render?: ComponentRenderFn<React.HTMLAttributes<any>, State> | React.ReactElement
  style?: React.CSSProperties | ((state: State) => React.CSSProperties | undefined)
}

export function useRenderElement<
  State extends Record<string, any>,
  RenderedElementType extends Element,
  TagName extends IntrinsicTagName | undefined,
>(
  element: TagName,
  componentProps: UseRenderElementComponentProps<State>,
  params: UseRenderElementParameters<State, RenderedElementType> = {},
): React.ReactElement | null {
  const { className: classNameProp, style: styleProp, render: renderProp } = componentProps
  const {
    state = EMPTY_OBJECT as State,
    ref,
    props: propsProp,
    enabled = true,
    defaultClassName,
  } = params

  const mergedRef = useMergedRefs(
    ...(Array.isArray(ref) ? ref : [ref]),
    getReactElementRef(renderProp as React.ReactElement | undefined),
  )

  if (!enabled) {
    return null
  }

  const className = resolveClassName(classNameProp, state)
  const style = resolveStyle(styleProp, state)

  const baseProps = typeof propsProp === 'function' ? propsProp({}) : (propsProp ?? {})
  
  const outProps: React.HTMLAttributes<any> & React.RefAttributes<any> = {
    ...baseProps,
    ref: mergedRef,
    className: cn(defaultClassName, (baseProps as React.HTMLAttributes<any>).className, className),
    style: { ...(baseProps as React.HTMLAttributes<any>).style, ...style },
  }

  if (renderProp) {
    if (typeof renderProp === 'function') {
      return renderProp(outProps, state)
    }
    const renderProps = (renderProp.props ?? {}) as Record<string, unknown>
    const mergedProps = {
      ...outProps,
      ...renderProps,
      className: cn(outProps.className as string, renderProps.className as string),
      style: { ...(outProps.style as object), ...(renderProps.style as object) },
    }
    return React.cloneElement(renderProp, mergedProps)
  }

  if (element) {
    if (element === 'button') {
      return <button type="button" {...outProps} />
    }
    return React.createElement(element, outProps)
  }

  throw new Error('Key UI: Render element or function are not defined.')
}

export namespace useRenderElement {
  export type Parameters<State, RenderedElementType extends Element> = UseRenderElementParameters<
    State,
    RenderedElementType
  >
  export type ComponentProps<State> = UseRenderElementComponentProps<State>
}

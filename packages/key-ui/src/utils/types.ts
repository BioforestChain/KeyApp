import * as React from 'react'

export type HTMLProps<T = any> = React.HTMLAttributes<T> & {
  ref?: React.Ref<T> | undefined
}

export type ComponentRenderFn<Props, State> = (
  props: Props,
  state: State,
) => React.ReactElement<unknown>

export type KeyUIComponentProps<
  ElementType extends React.ElementType,
  State,
  RenderFunctionProps = HTMLProps,
> = Omit<React.ComponentPropsWithRef<ElementType>, 'className'> & {
  className?: string | ((state: State) => string | undefined)
  render?: ComponentRenderFn<RenderFunctionProps, State> | React.ReactElement
  style?: React.CSSProperties | ((state: State) => React.CSSProperties | undefined)
}

export type Simplify<T> = T extends Function ? T : { [K in keyof T]: T[K] }

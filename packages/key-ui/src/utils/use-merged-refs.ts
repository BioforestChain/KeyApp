import * as React from 'react'

type Ref<T> = React.Ref<T> | undefined

export function useMergedRefs<T>(...refs: Ref<T>[]): React.RefCallback<T> {
  return React.useCallback((instance: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(instance)
      } else if (ref !== null && ref !== undefined) {
        ;(ref as React.MutableRefObject<T | null>).current = instance
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs)
}

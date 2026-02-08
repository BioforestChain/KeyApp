type SheetTask<T> = () => Promise<T>

const tails = new Map<string, Promise<void>>()

/**
 * Enqueue a UI sheet task for a miniapp.
 *
 * - FIFO per appId
 * - Each task waits for the previous one to settle
 * - Rejections do not break the queue
 */
export function enqueueMiniappSheet<T>(appId: string, task: SheetTask<T>): Promise<T> {
  const previous = tails.get(appId) ?? Promise.resolve()

  const run = previous
    .catch(() => undefined)
    .then(task)

  const nextTail = run.then(
    () => undefined,
    () => undefined,
  )

  tails.set(appId, nextTail)

  void nextTail.finally(() => {
    if (tails.get(appId) === nextTail) {
      tails.delete(appId)
    }
  })

  return run
}

/** @internal For tests only. */
export function __clearMiniappSheetQueueForTests(): void {
  tails.clear()
}


import type { MonochromeMaskOptions } from './monochrome-mask'

interface CreateMaskRequest {
  type: 'create-mask'
  id: number
  iconUrl: string
  options: MonochromeMaskOptions
}

interface CreateMaskResponse {
  type: 'create-mask-result'
  id: number
  dataUrl: string | null
  error?: string
}

type PendingRequest = {
  resolve: (dataUrl: string | null) => void
  reject: (error: Error) => void
}

type WorkerLike = {
  postMessage: (message: unknown) => void
  terminate: () => void
  onmessage: ((event: MessageEvent<CreateMaskResponse>) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
}

let worker: WorkerLike | null = null
let workerInitError: string | null = null
let nextRequestId = 1
const pending = new Map<number, PendingRequest>()

function ensureWorker(): WorkerLike | null {
  if (worker) {
    return worker
  }
  if (workerInitError) {
    return null
  }

  try {
    worker = new Worker(new URL('./monochrome-mask.worker.ts', import.meta.url), { type: 'module' })

    worker.onmessage = (event) => {
      const data = event.data
      if (!data || data.type !== 'create-mask-result') {
        return
      }

      const callback = pending.get(data.id)
      if (!callback) {
        return
      }

      pending.delete(data.id)
      if (data.error) {
        callback.reject(new Error(data.error))
      } else {
        callback.resolve(data.dataUrl)
      }
    }

    worker.onerror = () => {
      workerInitError = 'worker error'
      worker?.terminate()
      worker = null
      for (const [id, req] of pending) {
        pending.delete(id)
        req.reject(new Error('worker error'))
      }
    }

    return worker
  } catch (error) {
    workerInitError = error instanceof Error ? error.message : 'worker init failed'
    return null
  }
}

export async function createMonochromeMaskViaWorker(
  iconUrl: string,
  options: MonochromeMaskOptions,
): Promise<string | null> {
  const workerInstance = ensureWorker()
  if (!workerInstance) {
    throw new Error(workerInitError ?? 'worker is unavailable')
  }

  const id = nextRequestId++
  const request: CreateMaskRequest = {
    type: 'create-mask',
    id,
    iconUrl,
    options,
  }

  return await new Promise<string | null>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    workerInstance.postMessage(request)
  })
}


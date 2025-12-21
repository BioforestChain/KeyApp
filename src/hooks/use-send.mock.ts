import type { Dispatch, SetStateAction } from 'react'
import type { SendState } from './use-send.types'

export async function submitMockTransfer(
  setState: Dispatch<SetStateAction<SendState>>,
): Promise<{ status: 'ok' | 'error' }> {
  setState((prev) => ({
    ...prev,
    step: 'sending',
    isSubmitting: true,
  }))

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const isSuccess = Math.random() > 0.2 // 80% success rate

    if (isSuccess) {
      setState((prev) => ({
        ...prev,
        step: 'result',
        isSubmitting: false,
        resultStatus: 'success',
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        errorMessage: null,
      }))
      return { status: 'ok' }
    }

    throw new Error('交易失败，请稍后重试')
  } catch (error) {
    setState((prev) => ({
      ...prev,
      step: 'result',
      isSubmitting: false,
      resultStatus: 'failed',
      txHash: null,
      errorMessage: error instanceof Error ? error.message : '未知错误',
    }))
    return { status: 'error' }
  }
}

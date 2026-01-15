/**
 * Transaction pipeline handlers
 *
 * - bio_createTransaction: build unsigned tx (no signature, no broadcast)
 * - bio_signTransaction: sign unsigned tx (requires user confirmation)
 */

import type { MethodHandler, EcosystemTransferParams, UnsignedTransaction, SignedTransaction } from '../types'
import { BioErrorCodes } from '../types'
import { HandlerContext, type MiniappInfo, type SignTransactionParams } from './context'

import { Amount } from '@/types/amount'
import { chainConfigActions, chainConfigSelectors, chainConfigStore, walletStore } from '@/stores'
import { getChainProvider } from '@/services/chain-adapter/providers'
import { hexToBytes } from '@noble/hashes/utils.js'
import { deriveKey } from '@/lib/crypto/derivation'
import { createBioforestKeypair, publicKeyToBioforestAddress } from '@/lib/crypto'

function findWalletIdByAddress(chainId: string, address: string): string | null {
  const wallets = walletStore.state.wallets
  const isHexLike = address.startsWith('0x')
  const normalized = isHexLike ? address.toLowerCase() : address

  for (const wallet of wallets) {
    const match = wallet.chainAddresses.find((ca) => {
      if (ca.chain !== chainId) return false
      if (isHexLike || ca.address.startsWith('0x')) {
        return ca.address.toLowerCase() === normalized
      }
      return ca.address === normalized
    })
    if (match) return wallet.id
  }
  return null
}

async function getChainConfigOrThrow(chainId: string) {
  if (!chainConfigStore.state.snapshot) {
    await chainConfigActions.initialize()
  }

  const snapshot = chainConfigStore.state.snapshot
  if (!snapshot) {
    throw Object.assign(new Error('Chain configs not initialized'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const config = chainConfigSelectors.getChainById(chainConfigStore.state, chainId)
  if (!config) {
    throw Object.assign(new Error(`Unsupported chain: ${chainId}`), { code: BioErrorCodes.INVALID_PARAMS })
  }

  return config
}

/** bio_createTransaction - build unsigned tx */
export const handleCreateTransaction: MethodHandler = async (params, _context) => {
  const opts = params as Partial<EcosystemTransferParams> | undefined
  if (!opts?.from || !opts?.to || !opts?.amount || !opts?.chain) {
    throw Object.assign(
      new Error('Missing required parameters: from, to, amount, chain'),
      { code: BioErrorCodes.INVALID_PARAMS },
    )
  }

  const walletId = findWalletIdByAddress(opts.chain, opts.from)
  if (!walletId) {
    throw Object.assign(
      new Error('From address is not owned by current user'),
      { code: BioErrorCodes.UNAUTHORIZED },
    )
  }

  const chainConfig = await getChainConfigOrThrow(opts.chain)
  const amount = Amount.parse(opts.amount, chainConfig.decimals, chainConfig.symbol)

  const chainProvider = getChainProvider(chainConfig.id)
  if (!chainProvider.supportsBuildTransaction) {
    throw Object.assign(new Error(`Chain ${chainConfig.id} does not support transaction building`), { code: BioErrorCodes.UNSUPPORTED_METHOD })
  }

  const unsignedTx = await chainProvider.buildTransaction!({
    type: 'transfer',
    from: opts.from,
    to: opts.to,
    amount,
  })

  const result: UnsignedTransaction = {
    chainId: unsignedTx.chainId,
    intentType: unsignedTx.intentType,
    data: unsignedTx.data,
  }

  return result
}

// 兼容旧 API
let _showSignTransactionDialog: ((params: SignTransactionParams) => Promise<SignedTransaction | null>) | null = null

/** @deprecated 使用 HandlerContext.register 替代 */
export function setSignTransactionDialog(dialog: typeof _showSignTransactionDialog): void {
  _showSignTransactionDialog = dialog
}

function getSignTransactionDialog(appId: string) {
  const callbacks = HandlerContext.get(appId)
  return callbacks?.showSignTransactionDialog ?? _showSignTransactionDialog
}

/** bio_signTransaction - sign an unsigned tx (requires user confirmation) */
export const handleSignTransaction: MethodHandler = async (params, context) => {
  const opts = params as { from?: string; chain?: string; unsignedTx?: UnsignedTransaction } | undefined
  if (!opts?.from || !opts?.chain || !opts?.unsignedTx) {
    throw Object.assign(new Error('Missing required parameters: from, chain, unsignedTx'), { code: BioErrorCodes.INVALID_PARAMS })
  }

  const showDialog = getSignTransactionDialog(context.appId)
  if (!showDialog) {
    throw Object.assign(new Error('SignTransaction dialog not available'), { code: BioErrorCodes.INTERNAL_ERROR })
  }

  const result = await showDialog({
    from: opts.from,
    chain: opts.chain,
    unsignedTx: opts.unsignedTx,
    app: { name: context.appName } satisfies MiniappInfo,
  })

  if (!result) {
    throw Object.assign(new Error('User rejected'), { code: BioErrorCodes.USER_REJECTED })
  }

  return result
}

/**
 * Low-level signing helper for UI implementations.
 * Not exposed to miniapps directly.
 */
export async function signUnsignedTransaction(params: {
  walletId: string
  password: string
  from: string
  chainId: string
  unsignedTx: UnsignedTransaction
}): Promise<SignedTransaction> {
  const chainConfig = await getChainConfigOrThrow(params.chainId)

  const chainProvider = getChainProvider(chainConfig.id)
  if (!chainProvider.supportsSignTransaction) {
    throw Object.assign(new Error(`Chain ${chainConfig.id} does not support transaction signing`), { code: BioErrorCodes.UNSUPPORTED_METHOD })
  }

  // Derive chain private key from mnemonic/arbitrary secret.
  const mnemonic = await (await import('@/services/wallet-storage')).walletStorageService.getMnemonic(params.walletId, params.password)

  let privateKeyBytes: Uint8Array
  if (chainConfig.chainKind === 'evm') {
    const derived = deriveKey(mnemonic, 'ethereum', 0, 0)
    if (derived.address.toLowerCase() !== params.from.toLowerCase()) {
      throw Object.assign(new Error('Signing address mismatch'), { code: BioErrorCodes.INVALID_PARAMS })
    }
    privateKeyBytes = hexToBytes(derived.privateKey)
  } else if (chainConfig.chainKind === 'bioforest') {
    const keypair = createBioforestKeypair(mnemonic)
    const derivedAddress = publicKeyToBioforestAddress(keypair.publicKey, chainConfig.prefix ?? 'b')
    if (derivedAddress !== params.from) {
      throw Object.assign(new Error('Signing address mismatch'), { code: BioErrorCodes.INVALID_PARAMS })
    }
    privateKeyBytes = keypair.secretKey
  } else {
    throw Object.assign(new Error(`Unsupported chain kind: ${chainConfig.chainKind}`), { code: BioErrorCodes.UNSUPPORTED_METHOD })
  }

  const signed = await chainProvider.signTransaction!(
    { chainId: params.unsignedTx.chainId, intentType: params.unsignedTx.intentType ?? 'transfer', data: params.unsignedTx.data },
    chainConfig.chainKind === 'bioforest'
      ? { bioSecret: mnemonic, privateKey: privateKeyBytes }
      : { privateKey: privateKeyBytes },
  )

  return {
    chainId: signed.chainId,
    data: signed.data,
    signature: signed.signature,
  }
}

/**
 * Tron Transaction Mixin
 * 
 * 使用 Mixin Factory 模式为任意类添加 Tron Transaction 服务能力。
 * 
 * 支持的交易类型：
 * - transfer: 转账
 * - 其他类型抛出不支持错误
 */

import type { ChainConfig } from '@/services/chain-config'
import { chainConfigService } from '@/services/chain-config/service';
import type {
    ITransactionService,
    TransactionIntent,
    TransferIntent,
    SignOptions,
    UnsignedTransaction,
    SignedTransaction,
    TransactionHash,
    FeeEstimate,
    Fee,
} from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'
import type {
    TronRawTransaction,
    TronSignedTransaction,
} from './types'

type Constructor<T = object> = new (...args: any[]) => T

/** Default Tron RPC 端点 (fallback) */
const DEFAULT_RPC_URL = 'https://api.trongrid.io'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null
}

function formatTronSignature(txId: string, privateKey: Uint8Array): string {
    const txIdBytes = hexToBytes(txId)
    const recovered = secp256k1.sign(txIdBytes, privateKey, { prehash: false, format: 'recovered' })
    const recovery = recovered[0]
    const compact = recovered.subarray(1)
    const v = (recovery + 27).toString(16).padStart(2, '0')
    return `${bytesToHex(compact)}${v}`
}

function decodeTronErrorMessage(value: unknown): string | null {
    if (typeof value !== 'string') {
        return null
    }

    const trimmed = value.trim()
    if (!trimmed) {
        return null
    }

    const normalized = trimmed.startsWith('0x') ? trimmed.slice(2) : trimmed
    if (!/^[0-9a-fA-F]+$/.test(normalized) || normalized.length % 2 !== 0) {
        return trimmed
    }

    try {
        const decoded = new TextDecoder().decode(hexToBytes(normalized)).trim()
        return decoded || trimmed
    } catch {
        return trimmed
    }
}

function resolveBroadcastFailureReason(raw: unknown): string {
    if (!isRecord(raw)) {
        return 'Unknown error'
    }

    const candidates: unknown[] = [raw.message, raw.code, raw.error]

    if (isRecord(raw.result)) {
        candidates.push(raw.result.message, raw.result.code, raw.result.error)
    }

    for (const candidate of candidates) {
        const reason = decodeTronErrorMessage(candidate)
        if (reason) {
            return reason
        }
    }

    return 'Unknown error'
}

function isBroadcastSuccess(raw: unknown): boolean {
    if (!isRecord(raw)) {
        return false
    }

    if (typeof raw.result === 'boolean') {
        return raw.result
    }

    if (typeof raw.success === 'boolean') {
        return raw.success
    }

    return false
}

function unwrapSignedTransactionPayload(signedTx: SignedTransaction): TronSignedTransaction {
    const payload = signedTx.data
    if (isRecord(payload) && isRecord(payload.signedTx)) {
        return payload.signedTx as TronSignedTransaction
    }
    return payload as TronSignedTransaction
}

/**
 * Tron Transaction Mixin - 为任意类添加 Tron 交易能力
 * 
 * 要求基类有 chainId 属性
 */
export function TronTransactionMixin<TBase extends Constructor<{ chainId: string }>>(Base: TBase) {
    return class TronTransaction extends Base implements ITransactionService {
        #config: ChainConfig | null = null
        #rpcUrl: string = ''

        #getConfig(): ChainConfig {
            if (!this.#config) {
                const config = chainConfigService.getConfig(this.chainId)
                if (!config) {
                    throw new ChainServiceError(
                        ChainErrorCodes.CHAIN_NOT_SUPPORTED,
                        `Chain config not found: ${this.chainId}`,
                    )
                }
                this.#config = config
                this.#rpcUrl = chainConfigService.getRpcUrl(this.chainId) || DEFAULT_RPC_URL
            }
            return this.#config
        }

        async #api<T>(endpoint: string, body?: unknown): Promise<T> {
            const url = `${this.#rpcUrl}${endpoint}`
            const init: RequestInit = body
                ? {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                }
                : { method: 'GET' }

            const response = await fetch(url, init)
            if (!response.ok) {
                throw new ChainServiceError(
                    ChainErrorCodes.NETWORK_ERROR,
                    `Tron API error: ${response.status} ${response.statusText}`,
                )
            }

            return response.json() as Promise<T>
        }

        #base58ToHex(address: string): string {
            const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
            let num = BigInt(0)
            for (const char of address) {
                const index = ALPHABET.indexOf(char)
                if (index === -1) throw new Error(`Invalid base58 character: ${char}`)
                num = num * 58n + BigInt(index)
            }
            const hex = num.toString(16).padStart(50, '0')
            return hex.slice(0, 42)
        }

        /**
         * 构建未签名交易
         */
        async buildTransaction(intent: TransactionIntent): Promise<UnsignedTransaction> {
            if (intent.type !== 'transfer') {
                throw new ChainServiceError(
                    ChainErrorCodes.NOT_SUPPORTED,
                    `Transaction type not supported: ${intent.type}`,
                )
            }

            const transferIntent = intent as TransferIntent
            if (transferIntent.tokenAddress) {
                throw new ChainServiceError(
                    ChainErrorCodes.NOT_SUPPORTED,
                    'TRC20 transaction builder not available',
                )
            }
            const config = this.#getConfig()
            const ownerAddressHex = this.#base58ToHex(transferIntent.from)
            const toAddressHex = this.#base58ToHex(transferIntent.to)

            const rawTx = await this.#api<TronRawTransaction>('/wallet/createtransaction', {
                owner_address: ownerAddressHex,
                to_address: toAddressHex,
                amount: Number(transferIntent.amount.raw),
                visible: false,
            })

            if (!rawTx.txID) {
                throw new ChainServiceError(
                    ChainErrorCodes.TX_BUILD_FAILED,
                    'Failed to create Tron transaction',
                )
            }

            return {
                chainId: config.id,
                intentType: 'transfer',
                data: rawTx,
            }
        }

        /**
         * 估算手续费
         */
        async estimateFee(_unsignedTx: UnsignedTransaction): Promise<FeeEstimate> {
            const config = this.#getConfig()
            const feeAmount = Amount.fromRaw('0', config.decimals, config.symbol)
            const fee: Fee = {
                amount: feeAmount,
                estimatedTime: 3,
            }
            return { slow: fee, standard: fee, fast: fee }
        }

        /**
         * 签名交易
         */
        async signTransaction(
            unsignedTx: UnsignedTransaction,
            options: SignOptions,
        ): Promise<SignedTransaction> {
            if (!options.privateKey) {
                throw new ChainServiceError(
                    ChainErrorCodes.SIGNATURE_FAILED,
                    'privateKey is required for Tron signing',
                )
            }

            const rawTx = unsignedTx.data as TronRawTransaction
            const signature = formatTronSignature(rawTx.txID, options.privateKey)

            const signedTx: TronSignedTransaction = {
                ...rawTx,
                signature: [signature],
            }

            return {
                chainId: unsignedTx.chainId,
                data: signedTx,
                signature: signature,
            }
        }

        /**
         * 广播交易
         */
        async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
            const tx = unwrapSignedTransactionPayload(signedTx)
            const result = await this.#api<{ result?: boolean; txid?: string; code?: string; message?: string }>(
                '/wallet/broadcasttransaction',
                tx,
            )

            if (!isBroadcastSuccess(result)) {
                const errorMsg = resolveBroadcastFailureReason(result)
                throw new ChainServiceError(
                    ChainErrorCodes.TX_BROADCAST_FAILED,
                    `Broadcast failed: ${errorMsg}`,
                    { reason: errorMsg, response: isRecord(result) ? result : undefined },
                )
            }

            if (typeof result.txid === 'string' && result.txid.length > 0) {
                return result.txid
            }

            return tx.txID
        }
    }
}

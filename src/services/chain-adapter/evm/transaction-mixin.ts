/**
 * EVM Transaction Mixin
 * 
 * 使用 Mixin Factory 模式为任意类添加 EVM Transaction 服务能力。
 * 
 * 支持的交易类型：
 * - transfer: 转账
 * - 其他类型抛出不支持错误
 */

import { chainConfigService } from '@/services/chain-config/service'
import type {
    ITransactionService,
    TransactionIntent,
    TransferIntent,
    SignOptions,
    UnsignedTransaction,
    SignedTransaction,
    TransactionHash,
    FeeEstimate,
} from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import { secp256k1 } from '@noble/curves/secp256k1.js'
import { keccak_256 } from '@noble/hashes/sha3.js'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js'

type Constructor<T = object> = new (...args: any[]) => T

/** EVM Chain IDs */
const EVM_CHAIN_IDS: Record<string, number> = {
    ethereum: 1,
    'ethereum-sepolia': 11155111,
    binance: 56,
    'bsc-testnet': 97,
}

/**
 * EVM Transaction Mixin - 为任意类添加 EVM 交易能力
 * 
 * 要求基类有 chainId 属性
 */
export function EvmTransactionMixin<TBase extends Constructor<{ chainId: string }>>(Base: TBase) {
    return class EvmTransaction extends Base implements ITransactionService {
        #evmChainId: number | null = null

        get #rpcUrl(): string {
            return chainConfigService.getRpcUrl(this.chainId)
        }

        get #decimals(): number {
            return chainConfigService.getDecimals(this.chainId)
        }

        get #symbol(): string {
            return chainConfigService.getSymbol(this.chainId)
        }

        get #evmId(): number {
            if (this.#evmChainId === null) {
                this.#evmChainId = EVM_CHAIN_IDS[this.chainId] ?? 1
            }
            return this.#evmChainId
        }

        async #rpc<T>(method: string, params: unknown[] = []): Promise<T> {
            const response = await fetch(this.#rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: Date.now(),
                    method,
                    params,
                }),
            })

            if (!response.ok) {
                throw new ChainServiceError(
                    ChainErrorCodes.NETWORK_ERROR,
                    `HTTP ${response.status}: ${response.statusText}`,
                )
            }

            const json = (await response.json()) as { result?: T; error?: { code: number; message: string } }
            if (json.error) {
                throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, json.error.message, {
                    code: json.error.code,
                })
            }

            return json.result as T
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
            const nonceHex = await this.#rpc<string>('eth_getTransactionCount', [transferIntent.from, 'pending'])
            const nonce = parseInt(nonceHex, 16)
            const gasPriceHex = await this.#rpc<string>('eth_gasPrice')

            return {
                chainId: this.chainId,
                intentType: 'transfer',
                data: {
                    nonce,
                    gasPrice: gasPriceHex,
                    gasLimit: '0x5208',
                    to: transferIntent.to,
                    value: '0x' + transferIntent.amount.raw.toString(16),
                    data: '0x',
                    chainId: this.#evmId,
                },
            }
        }

        /**
         * 估算手续费
         */
        async estimateFee(_unsignedTx: UnsignedTransaction): Promise<FeeEstimate> {
            const gasPriceHex = await this.#rpc<string>('eth_gasPrice')
            const gasPrice = BigInt(gasPriceHex)
            const gasLimit = 21000n
            const baseFee = gasLimit * gasPrice

            const slow = Amount.fromRaw(((baseFee * 80n) / 100n).toString(), this.#decimals, this.#symbol)
            const standard = Amount.fromRaw(baseFee.toString(), this.#decimals, this.#symbol)
            const fast = Amount.fromRaw(((baseFee * 120n) / 100n).toString(), this.#decimals, this.#symbol)

            return {
                slow: { amount: slow, estimatedTime: 60 },
                standard: { amount: standard, estimatedTime: 15 },
                fast: { amount: fast, estimatedTime: 5 },
            }
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
                    'privateKey is required for EVM signing',
                )
            }

            const txData = unsignedTx.data as {
                nonce: number
                gasPrice: string
                gasLimit: string
                to: string
                value: string
                data: string
                chainId: number
            }

            const rawTx = this.#rlpEncode([
                this.#toRlpHex(txData.nonce),
                txData.gasPrice,
                txData.gasLimit,
                txData.to.toLowerCase(),
                txData.value,
                txData.data,
                this.#toRlpHex(txData.chainId),
                '0x',
                '0x',
            ])

            const msgHash = keccak_256(hexToBytes(rawTx.slice(2)))
            const sigBytes = secp256k1.sign(msgHash, options.privateKey, { prehash: false, format: 'recovered' })

            const r = BigInt('0x' + bytesToHex(sigBytes.slice(0, 32)))
            const s = BigInt('0x' + bytesToHex(sigBytes.slice(32, 64)))
            const recovery = sigBytes[64]!

            const v = txData.chainId * 2 + 35 + recovery

            const rHex = r.toString(16).padStart(64, '0')
            const sHex = s.toString(16).padStart(64, '0')

            const signedRaw = this.#rlpEncode([
                this.#toRlpHex(txData.nonce),
                txData.gasPrice,
                txData.gasLimit,
                txData.to.toLowerCase(),
                txData.value,
                txData.data,
                this.#toRlpHex(v),
                '0x' + rHex,
                '0x' + sHex,
            ])

            return {
                chainId: this.chainId,
                data: signedRaw,
                signature: '0x' + rHex + sHex,
            }
        }

        /**
         * 广播交易
         */
        async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
            const rawTx = signedTx.data as string
            const txHash = await this.#rpc<string>('eth_sendRawTransaction', [rawTx])
            return txHash
        }

        #toRlpHex(n: number): string {
            if (n === 0) return '0x'
            return '0x' + n.toString(16)
        }

        #rlpEncode(items: string[]): string {
            const encoded = items.map((item) => {
                if (item === '0x' || item === '') {
                    return new Uint8Array([0x80])
                }
                const bytes = hexToBytes(item.startsWith('0x') ? item.slice(2) : item)
                if (bytes.length === 1 && bytes[0]! < 0x80) {
                    return bytes
                }
                if (bytes.length <= 55) {
                    return new Uint8Array([0x80 + bytes.length, ...bytes])
                }
                const lenBytes = this.#numberToBytes(bytes.length)
                return new Uint8Array([0xb7 + lenBytes.length, ...lenBytes, ...bytes])
            })

            const totalLen = encoded.reduce((sum, e) => sum + e.length, 0)
            let prefix: Uint8Array
            if (totalLen <= 55) {
                prefix = new Uint8Array([0xc0 + totalLen])
            } else {
                const lenBytes = this.#numberToBytes(totalLen)
                prefix = new Uint8Array([0xf7 + lenBytes.length, ...lenBytes])
            }

            const result = new Uint8Array(prefix.length + totalLen)
            result.set(prefix)
            let offset = prefix.length
            for (const e of encoded) {
                result.set(e, offset)
                offset += e.length
            }
            return '0x' + bytesToHex(result)
        }

        #numberToBytes(n: number): Uint8Array {
            const hex = n.toString(16)
            const padded = hex.length % 2 ? '0' + hex : hex
            return hexToBytes(padded)
        }

    }
}

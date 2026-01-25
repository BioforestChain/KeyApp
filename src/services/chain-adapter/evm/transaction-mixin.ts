/**
 * EVM Transaction Mixin
 * 
 * 使用 Mixin Factory 模式为任意类添加 EVM Transaction 服务能力。
 * 
 * 支持的交易类型：
 * - transfer: 转账
 * - 其他类型抛出不支持错误
 */

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

const ERC20_TRANSFER_SELECTOR = bytesToHex(
    keccak_256(new TextEncoder().encode('transfer(address,uint256)')),
).slice(0, 8)

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

        async #getChainId(): Promise<number> {
            if (this.#evmChainId !== null) {
                return this.#evmChainId
            }
            try {
                const rpcChainId = await this.#rpc<string>('eth_chainId')
                const parsed = parseInt(rpcChainId, 16)
                if (Number.isFinite(parsed)) {
                    this.#evmChainId = parsed
                    return parsed
                }
            } catch {
                // ignore and fallback
            }
            this.#evmChainId = EVM_CHAIN_IDS[this.chainId] ?? 1
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
            const chainId = await this.#getChainId()
            const tokenAddress = transferIntent.tokenAddress?.toLowerCase()
            const isTokenTransfer = Boolean(tokenAddress)

            let to = transferIntent.to
            let value = '0x' + transferIntent.amount.raw.toString(16)
            let data = '0x'
            let gasLimit = '0x5208'

            if (isTokenTransfer && tokenAddress) {
                data = this.#encodeErc20TransferData(transferIntent.to, transferIntent.amount.raw)
                to = tokenAddress
                value = '0x'
                gasLimit = await this.#estimateGasSafe({
                    from: transferIntent.from,
                    to,
                    data,
                    value,
                })
            }

            return {
                chainId: this.chainId,
                intentType: 'transfer',
                data: {
                    nonce,
                    gasPrice: gasPriceHex,
                    gasLimit,
                    to,
                    value,
                    data,
                    chainId,
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
                chainId: number | string
            }
            const chainId = await this.#resolveChainId(txData.chainId)

            const rawTx = this.#rlpEncode([
                this.#toRlpHex(txData.nonce),
                txData.gasPrice,
                txData.gasLimit,
                txData.to.toLowerCase(),
                txData.value,
                txData.data,
                this.#toRlpHex(chainId),
                '0x',
                '0x',
            ])

            const msgHash = keccak_256(hexToBytes(rawTx.slice(2)))
            const sigBytes = secp256k1.sign(msgHash, options.privateKey, { prehash: false, format: 'recovered' })
            const recovery = sigBytes[0]!
            const r = BigInt('0x' + bytesToHex(sigBytes.slice(1, 33)))
            const s = BigInt('0x' + bytesToHex(sigBytes.slice(33, 65)))

            const v = chainId * 2 + 35 + recovery

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
                let hex = item.startsWith('0x') ? item.slice(2) : item
                if (hex.length % 2 === 1) {
                    hex = '0' + hex
                }
                const bytes = hexToBytes(hex)
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

        #encodeErc20TransferData(to: string, amount: bigint): string {
            const address = to.toLowerCase().replace(/^0x/, '').padStart(64, '0')
            const value = amount.toString(16).padStart(64, '0')
            return `0x${ERC20_TRANSFER_SELECTOR}${address}${value}`
        }

        async #resolveChainId(value: number | string): Promise<number> {
            if (typeof value === 'number' && Number.isFinite(value)) {
                return value
            }
            if (typeof value === 'string') {
                const trimmed = value.trim()
                if (trimmed) {
                    const parsed = trimmed.startsWith('0x')
                        ? parseInt(trimmed, 16)
                        : parseInt(trimmed, 10)
                    if (Number.isFinite(parsed)) {
                        return parsed
                    }
                }
            }
            return this.#getChainId()
        }

        async #estimateGasSafe(params: { from: string; to: string; data: string; value: string }): Promise<string> {
            try {
                return await this.#rpc<string>('eth_estimateGas', [params])
            } catch {
                return '0x186a0'
            }
        }

        #numberToBytes(n: number): Uint8Array {
            const hex = n.toString(16)
            const padded = hex.length % 2 ? '0' + hex : hex
            return hexToBytes(padded)
        }

    }
}

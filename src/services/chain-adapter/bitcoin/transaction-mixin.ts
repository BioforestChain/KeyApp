/**
 * Bitcoin Transaction Mixin
 * 
 * 使用 Mixin Factory 模式为任意类添加 Bitcoin Transaction 服务能力。
 */

import { chainConfigService } from '@/services/chain-config'
import type {
    ITransactionService,
    TransferParams,
    UnsignedTransaction,
    SignedTransaction,
    TransactionHash,
    FeeEstimate,
    Fee,
} from '../types'
import { Amount } from '@/types/amount'
import { ChainServiceError, ChainErrorCodes } from '../types'
import type { BitcoinUtxo, BitcoinUnsignedTx, BitcoinFeeEstimates } from './types'

type Constructor<T = object> = new (...args: any[]) => T

const DEFAULT_API_URL = 'https://mempool.space/api'

/**
 * Bitcoin Transaction Mixin - 为任意类添加 Bitcoin 交易能力
 * 
 * 要求基类有 chainId 属性
 */
export function BitcoinTransactionMixin<TBase extends Constructor<{ chainId: string }>>(Base: TBase) {
    return class BitcoinTransaction extends Base implements ITransactionService {
        #apiUrl: string | null = null

        get #mempoolApiUrl(): string {
            if (!this.#apiUrl) {
                this.#apiUrl = chainConfigService.getMempoolApi(this.chainId) ?? DEFAULT_API_URL
            }
            return this.#apiUrl
        }

        get #config() {
            return chainConfigService.getConfig(this.chainId)!
        }

        async #api<T>(endpoint: string, options?: RequestInit): Promise<T> {
            const url = `${this.#mempoolApiUrl}${endpoint}`
            const response = await fetch(url, options)

            if (!response.ok) {
                throw new ChainServiceError(
                    ChainErrorCodes.NETWORK_ERROR,
                    `Bitcoin API error: ${response.status}`,
                )
            }

            const text = await response.text()
            try {
                return JSON.parse(text) as T
            } catch {
                return text as T
            }
        }

        async estimateFee(_params: TransferParams): Promise<FeeEstimate> {
            try {
                const fees = await this.#api<BitcoinFeeEstimates>('/v1/fees/recommended')
                const typicalVsize = 140
                const config = this.#config

                const slow: Fee = {
                    amount: Amount.fromRaw((fees.hourFee * typicalVsize).toString(), config.decimals, config.symbol),
                    estimatedTime: 3600,
                }

                const standard: Fee = {
                    amount: Amount.fromRaw((fees.halfHourFee * typicalVsize).toString(), config.decimals, config.symbol),
                    estimatedTime: 1800,
                }

                const fast: Fee = {
                    amount: Amount.fromRaw((fees.fastestFee * typicalVsize).toString(), config.decimals, config.symbol),
                    estimatedTime: 600,
                }

                return { slow, standard, fast }
            } catch {
                const config = this.#config
                const defaultFee: Fee = {
                    amount: Amount.fromRaw('2000', config.decimals, config.symbol),
                    estimatedTime: 1800,
                }
                return { slow: defaultFee, standard: defaultFee, fast: defaultFee }
            }
        }

        async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
            const utxos = await this.#api<BitcoinUtxo[]>(`/address/${params.from}/utxo`)

            if (utxos.length === 0) {
                throw new ChainServiceError(ChainErrorCodes.INSUFFICIENT_BALANCE, 'No UTXOs available')
            }

            const fees = await this.#api<BitcoinFeeEstimates>('/v1/fees/recommended')
            const feeRate = fees.halfHourFee

            const totalInput = utxos.reduce((sum, u) => sum + u.value, 0)
            const sendAmount = Number(params.amount.raw)
            const estimatedVsize = 10 + utxos.length * 68 + 2 * 31
            const fee = feeRate * estimatedVsize

            if (totalInput < sendAmount + fee) {
                throw new ChainServiceError(
                    ChainErrorCodes.INSUFFICIENT_BALANCE,
                    `Insufficient balance: need ${sendAmount + fee}, have ${totalInput}`,
                )
            }

            const change = totalInput - sendAmount - fee
            const config = this.#config

            const txData: BitcoinUnsignedTx = {
                inputs: utxos.map(u => ({
                    txid: u.txid,
                    vout: u.vout,
                    value: u.value,
                    scriptPubKey: '',
                })),
                outputs: [{ address: params.to, value: sendAmount }],
                fee,
                changeAddress: params.from,
            }

            if (change > 546) {
                txData.outputs.push({ address: params.from, value: change })
            }

            return { chainId: config.id, data: txData }
        }

        async signTransaction(
            _unsignedTx: UnsignedTransaction,
            _privateKey: Uint8Array,
        ): Promise<SignedTransaction> {
            throw new ChainServiceError(
                ChainErrorCodes.CHAIN_NOT_SUPPORTED,
                'Bitcoin transaction signing requires specialized library (bitcoinjs-lib or similar)',
            )
        }

        async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
            const txHex = signedTx.data as string
            const txid = await this.#api<string>('/tx', {
                method: 'POST',
                body: txHex,
            })
            return txid
        }
    }
}

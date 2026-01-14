import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type {
    ITransactionService,
    TransferParams,
    FeeEstimate,
    Fee,
    UnsignedTransaction,
    SignedTransaction,
    TransactionHash,
} from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import { signMessage, bytesToHex } from '@/lib/crypto'
import { getTransferMinFee } from '@/services/bioforest-sdk'

type Constructor<T = object> = new (...args: any[]) => T

/**
 * Bioforest Transaction Mixin - 为任意类添加 Bioforest 交易能力
 * 
 * 要求基类有 chainId 属性
 */
export function BioforestTransactionMixin<TBase extends Constructor<{ chainId: string }>>(Base: TBase) {
    return class BioforestTransaction extends Base implements ITransactionService {
        #baseUrl: string | null = null

        get #config() {
            return chainConfigService.getConfig(this.chainId)!
        }

        get #apiUrl(): string {
            if (!this.#baseUrl) {
                this.#baseUrl = chainConfigService.getBiowalletApi(this.chainId) ?? ''
            }
            return this.#baseUrl
        }

        async estimateFee(params: TransferParams): Promise<FeeEstimate> {
            const config = this.#config
            const { decimals, symbol } = config

            const createFee = (amount: Amount, time: number): Fee => ({
                amount,
                estimatedTime: time,
            })

            if (!this.#apiUrl) {
                throw new ChainServiceError(
                    ChainErrorCodes.NETWORK_ERROR,
                    'RPC URL not configured for BioForest chain',
                )
            }

            try {
                const minFeeRaw = await getTransferMinFee(
                    this.#apiUrl,
                    config.id,
                    params.from,
                    params.amount?.toRawString(),
                    undefined,
                )

                const minFee = Amount.fromRaw(minFeeRaw, decimals, symbol)

                return {
                    slow: createFee(minFee, 30),
                    standard: createFee(minFee, 15),
                    fast: createFee(minFee.mul(2), 5),
                }
            } catch (error) {
                throw new ChainServiceError(
                    ChainErrorCodes.NETWORK_ERROR,
                    'Failed to calculate minimum fee from SDK',
                    undefined,
                    error instanceof Error ? error : undefined,
                )
            }
        }

        async buildTransaction(params: TransferParams): Promise<UnsignedTransaction> {
            const config = this.#config
            if (!params.from || !params.to) {
                throw new ChainServiceError(ChainErrorCodes.INVALID_ADDRESS, 'Invalid address')
            }

            const feeEstimate = await this.estimateFee(params)

            return {
                chainId: config.id,
                data: {
                    type: 'transfer',
                    from: params.from,
                    to: params.to,
                    amount: params.amount.toRawString(),
                    assetType: config.symbol,
                    fee: feeEstimate.standard.amount.toRawString(),
                    memo: params.memo,
                    timestamp: Date.now(),
                },
            }
        }

        async signTransaction(
            unsignedTx: UnsignedTransaction,
            privateKey: Uint8Array,
        ): Promise<SignedTransaction> {
            const txData = unsignedTx.data as Record<string, unknown>

            const signableData = JSON.stringify({
                type: txData.type,
                from: txData.from,
                to: txData.to,
                amount: txData.amount,
                assetType: txData.assetType,
                fee: txData.fee,
                timestamp: txData.timestamp,
                memo: txData.memo ?? '',
            })

            const signature = signMessage(signableData, privateKey)
            const signatureHex = bytesToHex(signature)

            return {
                chainId: unsignedTx.chainId,
                data: {
                    ...txData,
                    signature: signatureHex,
                    publicKey: bytesToHex(privateKey.slice(32, 64)),
                },
                signature: signatureHex,
            }
        }

        async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
            if (!this.#apiUrl) {
                throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, 'RPC URL not configured')
            }

            try {
                const response = await fetch(
                    `${this.#apiUrl}/transactions/broadcast`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ transaction: signedTx.data }),
                    },
                )

                if (!response.ok) {
                    const errorData = (await response.json().catch(() => ({}))) as { message?: string }
                    throw new ChainServiceError(
                        ChainErrorCodes.TRANSACTION_REJECTED,
                        errorData.message ?? `Broadcast failed: ${response.status}`,
                    )
                }

                const json = (await response.json()) as { success: boolean; result?: unknown; error?: { message?: string } }
                if (!json.success) {
                    throw new ChainServiceError(
                        ChainErrorCodes.TRANSACTION_REJECTED,
                        json.error?.message ?? 'Broadcast failed',
                    )
                }
                return signedTx.signature
            } catch (error) {
                if (error instanceof ChainServiceError) throw error
                throw new ChainServiceError(
                    ChainErrorCodes.NETWORK_ERROR,
                    'Failed to broadcast transaction',
                    undefined,
                    error instanceof Error ? error : undefined,
                )
            }
        }
    }
}

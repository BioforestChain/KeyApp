import { chainConfigService } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import type {
    ITransactionService,
    TransactionIntent,
    TransferIntent,
    DestroyIntent,
    SetPayPasswordIntent,
    SignOptions,
    FeeEstimate,
    Fee,
    UnsignedTransaction,
    SignedTransaction,
    TransactionHash,
} from '../types'
import { ChainServiceError, ChainErrorCodes } from '../types'
import {
    createTransferTransaction,
    createDestroyTransaction,
    createSignatureTransaction,
    broadcastTransaction as sdkBroadcast,
    getTransferMinFee,
    getDestroyTransactionMinFee,
    getSignatureTransactionMinFee,
} from '@/services/bioforest-sdk'

type Constructor<T = object> = new (...args: any[]) => T

/**
 * Bioforest Transaction Mixin - 为任意类添加 Bioforest 交易能力
 * 
 * 支持的交易类型：
 * - transfer: 转账
 * - destroy: 销毁资产
 * - setPayPassword: 设置支付密码
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

        /**
         * 构建未签名交易
         */
        async buildTransaction(intent: TransactionIntent): Promise<UnsignedTransaction> {
            switch (intent.type) {
                case 'transfer':
                    return this.#buildTransferTransaction(intent)
                case 'destroy':
                    return this.#buildDestroyTransaction(intent)
                case 'setPayPassword':
                    return this.#buildSetPayPasswordTransaction(intent)
                default:
                    throw new ChainServiceError(
                        ChainErrorCodes.NOT_SUPPORTED,
                        `Transaction type not supported: ${(intent).type}`,
                    )
            }
        }

        async #buildTransferTransaction(intent: TransferIntent): Promise<UnsignedTransaction> {
            const config = this.#config
            if (!intent.from || !intent.to) {
                throw new ChainServiceError(ChainErrorCodes.INVALID_ADDRESS, 'Invalid address')
            }

            return {
                chainId: config.id,
                intentType: 'transfer',
                data: {
                    from: intent.from,
                    to: intent.to,
                    amount: intent.amount.toRawString(),
                    assetType: intent.bioAssetType ?? config.symbol,
                    memo: intent.memo,
                    remark: intent.remark,
                },
                estimatedFee: intent.fee,
            }
        }

        async #buildDestroyTransaction(intent: DestroyIntent): Promise<UnsignedTransaction> {
            const config = this.#config
            if (!intent.from || !intent.recipientId) {
                throw new ChainServiceError(ChainErrorCodes.INVALID_ADDRESS, 'Invalid address')
            }

            return {
                chainId: config.id,
                intentType: 'destroy',
                data: {
                    from: intent.from,
                    recipientId: intent.recipientId,
                    amount: intent.amount.toRawString(),
                    assetType: intent.bioAssetType,
                },
                estimatedFee: intent.fee,
            }
        }

        async #buildSetPayPasswordTransaction(intent: SetPayPasswordIntent): Promise<UnsignedTransaction> {
            const config = this.#config
            if (!intent.from) {
                throw new ChainServiceError(ChainErrorCodes.INVALID_ADDRESS, 'Invalid address')
            }

            return {
                chainId: config.id,
                intentType: 'setPayPassword',
                data: {
                    from: intent.from,
                },
                estimatedFee: intent.fee,
            }
        }

        /**
         * 估算手续费
         */
        async estimateFee(unsignedTx: UnsignedTransaction): Promise<FeeEstimate> {
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
                let minFeeRaw: string

                switch (unsignedTx.intentType) {
                    case 'transfer': {
                        const data = unsignedTx.data as { from: string; amount?: string }
                        minFeeRaw = await getTransferMinFee(
                            this.#apiUrl,
                            config.id,
                            data.from,
                            data.amount,
                            undefined,
                        )
                        break
                    }
                    case 'destroy': {
                        const data = unsignedTx.data as { assetType: string; amount: string }
                        minFeeRaw = await getDestroyTransactionMinFee(
                            this.#apiUrl,
                            config.id,
                            data.assetType,
                            data.amount,
                        )
                        break
                    }
                    case 'setPayPassword': {
                        minFeeRaw = await getSignatureTransactionMinFee(this.#apiUrl, config.id)
                        break
                    }
                    default:
                        throw new ChainServiceError(
                            ChainErrorCodes.NOT_SUPPORTED,
                            `Fee estimation not supported for: ${unsignedTx.intentType}`,
                        )
                }

                const minFee = Amount.fromRaw(minFeeRaw, decimals, symbol)

                return {
                    slow: createFee(minFee, 30),
                    standard: createFee(minFee, 15),
                    fast: createFee(minFee.mul(2), 5),
                }
            } catch (error) {
                if (error instanceof ChainServiceError) throw error
                throw new ChainServiceError(
                    ChainErrorCodes.NETWORK_ERROR,
                    'Failed to calculate minimum fee from SDK',
                    undefined,
                    error instanceof Error ? error : undefined,
                )
            }
        }

        /**
         * 签名交易
         * 
         * BioChain 使用 SDK 的 createXxxTransaction 方法，同时完成构建和签名
         */
        async signTransaction(
            unsignedTx: UnsignedTransaction,
            options: SignOptions,
        ): Promise<SignedTransaction> {
            if (!options.bioSecret) {
                throw new ChainServiceError(
                    ChainErrorCodes.SIGNATURE_FAILED,
                    'bioSecret is required for BioChain signing',
                )
            }

            if (!this.#apiUrl) {
                throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, 'RPC URL not configured')
            }

            const config = this.#config

            try {
                switch (unsignedTx.intentType) {
                    case 'transfer': {
                        const data = unsignedTx.data as {
                            from: string
                            to: string
                            amount: string
                            assetType: string
                            memo?: string
                            remark?: Record<string, string>
                        }

                        // 获取手续费
                        const feeEstimate = unsignedTx.estimatedFee
                            ? unsignedTx.estimatedFee.toRawString()
                            : (await this.estimateFee(unsignedTx)).standard.amount.toRawString()

                        const remark = data.remark ?? (data.memo ? { memo: data.memo } : undefined)

                        const tx = await createTransferTransaction({
                            baseUrl: this.#apiUrl,
                            chainId: config.id,
                            mainSecret: options.bioSecret,
                            paySecret: options.bioPaySecret,
                            from: data.from,
                            to: data.to,
                            amount: data.amount,
                            assetType: data.assetType,
                            fee: feeEstimate,
                            remark,
                        })

                        return {
                            chainId: unsignedTx.chainId,
                            data: tx,
                            signature: tx.signature,
                        }
                    }

                    case 'destroy': {
                        const data = unsignedTx.data as {
                            from: string
                            recipientId: string
                            amount: string
                            assetType: string
                        }

                        const feeEstimate = unsignedTx.estimatedFee
                            ? unsignedTx.estimatedFee.toRawString()
                            : (await this.estimateFee(unsignedTx)).standard.amount.toRawString()

                        const tx = await createDestroyTransaction({
                            baseUrl: this.#apiUrl,
                            chainId: config.id,
                            mainSecret: options.bioSecret,
                            paySecret: options.bioPaySecret,
                            from: data.from,
                            recipientId: data.recipientId,
                            assetType: data.assetType,
                            amount: data.amount,
                            fee: feeEstimate,
                        })

                        return {
                            chainId: unsignedTx.chainId,
                            data: tx,
                            signature: tx.signature,
                        }
                    }

                    case 'setPayPassword': {
                        if (!options.bioNewPaySecret) {
                            throw new ChainServiceError(
                                ChainErrorCodes.SIGNATURE_FAILED,
                                'bioNewPaySecret is required for setPayPassword',
                            )
                        }

                        const tx = await createSignatureTransaction({
                            baseUrl: this.#apiUrl,
                            chainId: config.id,
                            mainSecret: options.bioSecret,
                            newPaySecret: options.bioNewPaySecret,
                        })

                        return {
                            chainId: unsignedTx.chainId,
                            data: tx,
                            signature: tx.signature,
                        }
                    }

                    default:
                        throw new ChainServiceError(
                            ChainErrorCodes.NOT_SUPPORTED,
                            `Signing not supported for: ${unsignedTx.intentType}`,
                        )
                }
            } catch (error) {
                if (error instanceof ChainServiceError) throw error
                throw new ChainServiceError(
                    ChainErrorCodes.SIGNATURE_FAILED,
                    'Failed to sign transaction',
                    undefined,
                    error instanceof Error ? error : undefined,
                )
            }
        }

        /**
         * 广播交易
         */
        async broadcastTransaction(signedTx: SignedTransaction): Promise<TransactionHash> {
            if (!this.#apiUrl) {
                throw new ChainServiceError(ChainErrorCodes.NETWORK_ERROR, 'RPC URL not configured')
            }

            try {
                // signedTx.data 是 SDK 创建的交易对象
                const result = await sdkBroadcast(this.#apiUrl, signedTx.data as any)
                return result.txHash
            } catch (error) {
                if (error instanceof ChainServiceError) throw error
                throw new ChainServiceError(
                    ChainErrorCodes.TX_BROADCAST_FAILED,
                    'Failed to broadcast transaction',
                    undefined,
                    error instanceof Error ? error : undefined,
                )
            }
        }
    }
}

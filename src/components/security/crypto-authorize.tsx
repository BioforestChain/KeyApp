/**
 * Crypto 授权对话框组件
 *
 * 显示授权请求信息，让用户输入手势密码确认授权
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PatternLock, patternToString } from './pattern-lock'
import { walletStorageService } from '@/services/wallet-storage'
import {
    type CryptoAction,
    type TokenDuration,
    CRYPTO_ACTION_LABELS,
    TOKEN_DURATION_LABELS,
} from '@/services/crypto-box'

export interface CryptoAuthorizeProps {
    /** 请求的操作权限 */
    actions: CryptoAction[]
    /** 授权时长 */
    duration: TokenDuration
    /** 使用的地址 */
    address: string
    /** 请求来源应用 */
    app: {
        name: string
        icon?: string
    }
    /** 确认回调 */
    onConfirm: (patternKey: string) => void
    /** 取消回调 */
    onCancel: () => void
}

/**
 * Crypto 授权对话框
 */
export function CryptoAuthorize({
    actions,
    duration,
    address,
    app,
    onConfirm,
    onCancel,
}: CryptoAuthorizeProps) {
    const { t } = useTranslation()
    const [pattern, setPattern] = useState<number[]>([])
    const [error, setError] = useState(false)
    const [verifying, setVerifying] = useState(false)

    const handlePatternComplete = useCallback(
        async (nodes: number[]) => {
            setVerifying(true)
            setError(false)

            try {
                const patternKey = patternToString(nodes)

                // 验证手势密码是否正确（尝试解密任意钱包的 mnemonic）
                const wallets = await walletStorageService.getAllWallets()
                if (wallets.length === 0) {
                    setError(true)
                    setPattern([])
                    return
                }

                let isValid = false
                for (const wallet of wallets) {
                    try {
                        await walletStorageService.getMnemonic(wallet.id, patternKey)
                        isValid = true
                        break
                    } catch {
                        // 继续尝试下一个钱包
                    }
                }

                if (isValid) {
                    onConfirm(patternKey)
                } else {
                    setError(true)
                    setPattern([])
                }
            } catch {
                setError(true)
                setPattern([])
            } finally {
                setVerifying(false)
            }
        },
        [onConfirm]
    )

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            data-testid="crypto-authorize-dialog"
        >
            <div className="mx-4 w-full max-w-sm rounded-2xl bg-background p-6 shadow-xl">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="mb-2 flex items-center justify-center gap-2">
                        {app.icon && (
                            <img src={app.icon} alt="" className="size-8 rounded-lg" />
                        )}
                        <h2 className="text-lg font-semibold">{app.name}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t('crypto.authorize.title', { defaultValue: '请求加密授权' })}
                    </p>
                </div>

                {/* 请求的权限 */}
                <div className="mb-4 rounded-lg bg-muted p-4">
                    <div className="mb-2 text-sm font-medium">
                        {t('crypto.authorize.permissions', { defaultValue: '请求权限' })}
                    </div>
                    <ul className="space-y-2">
                        {actions.map((action) => (
                            <li key={action} className="flex items-start gap-2 text-sm">
                                <span className="mt-0.5 text-primary">✓</span>
                                <div>
                                    <div className="font-medium">{CRYPTO_ACTION_LABELS[action].name}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {CRYPTO_ACTION_LABELS[action].description}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 授权时长和地址 */}
                <div className="mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t('crypto.authorize.duration', { defaultValue: '授权时长' })}
                        </span>
                        <span className="font-medium">{TOKEN_DURATION_LABELS[duration]}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t('crypto.authorize.address', { defaultValue: '使用地址' })}
                        </span>
                        <span className="font-mono text-xs">
                            {address.slice(0, 8)}...{address.slice(-6)}
                        </span>
                    </div>
                </div>

                {/* 手势密码 */}
                <div className="mb-4">
                    <div className="mb-2 text-center text-sm text-muted-foreground">
                        {t('crypto.authorize.pattern', { defaultValue: '请输入手势密码确认' })}
                    </div>
                    <div className="flex justify-center">
                        <PatternLock
                            value={pattern}
                            onChange={setPattern}
                            onComplete={handlePatternComplete}
                            error={error}
                            disabled={verifying}
                            data-testid="crypto-authorize-pattern"
                        />
                    </div>
                    {error && (
                        <p className="mt-2 text-center text-sm text-destructive">
                            {t('crypto.authorize.error', { defaultValue: '手势密码错误，请重试' })}
                        </p>
                    )}
                </div>

                {/* 取消按钮 */}
                <button
                    type="button"
                    className="w-full rounded-lg border border-border py-2 text-sm font-medium transition-colors hover:bg-muted"
                    onClick={onCancel}
                    disabled={verifying}
                >
                    {t('common.cancel', { defaultValue: '取消' })}
                </button>
            </div>
        </div>
    )
}

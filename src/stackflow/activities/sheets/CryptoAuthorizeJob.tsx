/**
 * CryptoAuthorizeJob - Crypto 黑盒授权对话框
 * 
 * 用于小程序请求加密操作授权，用户需输入手势密码确认
 */

import { useCallback, useState } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { IconLock, IconLoader2 } from '@tabler/icons-react'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'
import { MiniappSheetHeader } from '@/components/ecosystem'
import { PatternLock, patternToString } from '@/components/security/pattern-lock'
import { walletStorageService } from '@/services/wallet-storage'
import {
    type CryptoAction,
    type TokenDuration,
    CRYPTO_ACTION_LABELS,
    TOKEN_DURATION_LABELS,
    TOKEN_DURATION_OPTIONS,
} from '@/services/crypto-box'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { walletStore } from '@/stores'

type CryptoAuthorizeJobParams = {
    /** 请求的操作权限 (JSON 字符串) */
    actions: string
    /** 授权时长 */
    duration: string
    /** 使用的地址 */
    address: string
    /** 链 ID */
    chainId?: string
    /** 请求来源小程序名称 */
    appName?: string
    /** 请求来源小程序图标 */
    appIcon?: string
}

function CryptoAuthorizeJobContent() {
    const { t } = useTranslation('common')
    const { pop } = useFlow()
    const params = useActivityParams<CryptoAuthorizeJobParams>()

    const actions = JSON.parse(params.actions) as CryptoAction[]
    const duration = params.duration as TokenDuration
    const { address, chainId, appName, appIcon } = params

    // 找到使用该地址的钱包
    const targetWallet = walletStore.state.wallets.find(
        w => w.chainAddresses.some(ca => ca.address === address)
    )
    const walletName = targetWallet?.name
    const walletId = targetWallet?.id

    const [pattern, setPattern] = useState<number[]>([])
    const [error, setError] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState<TokenDuration>(duration)

    const handlePatternComplete = useCallback(
        async (nodes: number[]) => {
            setIsVerifying(true)
            setError(false)

            try {
                const patternKey = patternToString(nodes)

                // 验证手势密码是否正确
                const wallets = await walletStorageService.getAllWallets()
                if (wallets.length === 0) {
                    setError(true)
                    setPattern([])
                    setIsVerifying(false)
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

                if (isValid && walletId) {
                    // 发送成功事件（包含 walletId 和 selectedDuration 用于 Token 创建）
                    const event = new CustomEvent('crypto-authorize-confirm', {
                        detail: { approved: true, patternKey, walletId, selectedDuration },
                    })
                    window.dispatchEvent(event)
                    pop()
                } else {
                    setError(true)
                    setPattern([])
                }
            } catch {
                setError(true)
                setPattern([])
            } finally {
                setIsVerifying(false)
            }
        },
        [pop, selectedDuration]
    )

    const handleCancel = useCallback(() => {
        const event = new CustomEvent('crypto-authorize-confirm', {
            detail: { approved: false },
        })
        window.dispatchEvent(event)
        pop()
    }, [pop])

    return (
        <BottomSheet>
            <div className="bg-background rounded-t-2xl flex flex-col max-h-[85vh]">
                {/* Handle */}
                <div className="flex justify-center py-2 flex-shrink-0">
                    <div className="bg-muted h-1 w-10 rounded-full" />
                </div>

                {/* Header - 左侧 miniapp 信息，右侧钱包信息 */}
                <MiniappSheetHeader
                    title={t('cryptoAuthorize', '加密授权')}
                    description={appName || t('unknownDApp', '未知 DApp')}
                    appName={appName}
                    appIcon={appIcon}
                    walletInfo={{
                        name: walletName || t('unknownWallet', '未知钱包'),
                        address,
                        chainId: chainId || 'bfmeta',
                    }}
                />

                {/* Content - 可滚动区域 */}
                <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
                    {/* 权限和授权时长 */}
                    <div className="bg-muted/50 rounded-xl p-3 space-y-2 text-sm">
                        {/* 请求权限 - 水平排列 */}
                        <div className="flex items-center gap-2">
                            <IconLock className="text-primary size-4 flex-shrink-0" />
                            <span className="text-muted-foreground">{t('permissions', '权限')}：</span>
                            <span className="font-medium truncate">
                                {actions.map(a => CRYPTO_ACTION_LABELS[a]?.name || a).join('、')}
                            </span>
                        </div>

                        {/* 授权时长 */}
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground ml-6">{t('duration', '时长')}：</span>
                            <Select
                                value={selectedDuration}
                                onValueChange={(value) => setSelectedDuration(value as TokenDuration)}
                            >
                                <SelectTrigger className="h-7 w-24 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TOKEN_DURATION_OPTIONS.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {TOKEN_DURATION_LABELS[option]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* 手势密码区域 - 固定尺寸不可压缩 */}
                <div className="flex-shrink-0 px-4 pb-2">
                    <p className="text-muted-foreground mb-2 text-center text-xs">
                        {t('drawPatternToConfirm', '请绘制手势密码确认')}
                    </p>
                    {/* 固定尺寸容器，防止内容变化导致布局抖动 */}
                    <div className="flex justify-center">
                        <div className="w-[280px]">
                            <PatternLock
                                value={pattern}
                                onChange={setPattern}
                                onComplete={handlePatternComplete}
                                error={error}
                                disabled={isVerifying}
                            />
                        </div>
                    </div>
                    {/* 验证中状态 - 固定高度 */}
                    <div className="h-6 flex items-center justify-center">
                        {isVerifying && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <IconLoader2 className="size-4 animate-spin" />
                                <span className="text-xs">{t('verifying', '验证中...')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Cancel button */}
                <div className="px-4 pb-2 flex-shrink-0">
                    <button
                        onClick={handleCancel}
                        disabled={isVerifying}
                        className="bg-muted hover:bg-muted/80 disabled:opacity-50 w-full rounded-xl py-2.5 text-sm font-medium transition-colors"
                    >
                        {t('cancel', '取消')}
                    </button>
                </div>

                {/* Safe area */}
                <div className="h-[env(safe-area-inset-bottom)] flex-shrink-0" />
            </div>
        </BottomSheet>
    )
}

export const CryptoAuthorizeJob: ActivityComponentType<CryptoAuthorizeJobParams> = ({ params }) => {
    return (
        <ActivityParamsProvider params={params}>
            <CryptoAuthorizeJobContent />
        </ActivityParamsProvider>
    )
}

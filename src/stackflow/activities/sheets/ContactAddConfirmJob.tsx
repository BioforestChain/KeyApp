/**
 * ContactAddConfirmJob - 扫码添加联系人确认
 * 
 * 从扫码结果预填充联系人信息，让用户确认后添加
 */

import { useState, useCallback } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  IconWallet as Wallet,
  IconCheck as Check,
  IconRefresh as Refresh,
} from '@tabler/icons-react'
import { ContactAvatar } from '@/components/common/contact-avatar'
import { generateAvatarFromAddress } from '@/lib/avatar-codec'
import { cn } from '@/lib/utils'
import { detectAddressFormat } from '@/lib/address-format'
import { addressBookActions } from '@/stores'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'

/** Job 参数 */
export type ContactAddConfirmJobParams = {
  /** 联系人名称 */
  name: string
  /** 地址列表 JSON */
  addresses: string
  /** 备注 */
  memo?: string | undefined
  /** 头像 */
  avatar?: string | undefined
}

interface AddressInfo {
  address: string
  label?: string
}

function ContactAddConfirmJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const params = useActivityParams<ContactAddConfirmJobParams>()
  
  const [name, setName] = useState(params.name || '')
  const [memo, setMemo] = useState(params.memo || '')
  const [avatarSeed, setAvatarSeed] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  
  // 解析地址列表
  const addresses: AddressInfo[] = (() => {
    try {
      return JSON.parse(params.addresses || '[]')
    } catch {
      return []
    }
  })()
  
  // 切换头像
  const handleChangeAvatar = useCallback(() => {
    setAvatarSeed(prev => prev + 1)
  }, [])
  
  const handleSave = useCallback(async () => {
    if (!name.trim() || addresses.length === 0) return
    
    setIsSaving(true)
    try {
      // 生成最终头像（avatar:HASH 格式）
      const finalAvatar = params.avatar || 
        (addresses[0]?.address ? generateAvatarFromAddress(addresses[0].address, avatarSeed) : undefined)
      
      // 添加联系人
      addressBookActions.addContact({
        name: name.trim(),
        addresses: addresses.map((a, i) => ({
          id: `addr-${i}`,
          address: a.address,
          label: a.label,
          isDefault: i === 0,
        })),
        memo: memo.trim() || undefined,
        avatar: finalAvatar,
      })
      
      setSaved(true)
      setTimeout(() => pop(), 500)
    } catch (err) {
      
    } finally {
      setIsSaving(false)
    }
  }, [name, memo, addresses, params.avatar, avatarSeed, pop])
  
  const handleCancel = useCallback(() => {
    pop()
  }, [pop])
  
  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        
        {/* Title */}
        <div className="border-border border-b px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">
            {t('addressBook.addContact')}
          </h2>
        </div>
        
        {/* Content */}
        <div className="space-y-4 p-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleChangeAvatar}
              className="group relative"
              title={t('addressBook.changeAvatar')}
            >
              <ContactAvatar
                src={params.avatar || (addresses[0]?.address ? generateAvatarFromAddress(addresses[0].address, avatarSeed) : undefined)}
                size={48}
              />
              {!params.avatar && (
                <div className="bg-background/80 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100">
                  <Refresh className="text-primary size-5" />
                </div>
              )}
            </button>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('addressBook.namePlaceholder')}
              className="flex-1"
            />
          </div>
          
          {/* Addresses */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm">
              {t('addressBook.addresses')}
            </label>
            <div className="space-y-2">
              {addresses.map((addr, i) => {
                const detected = detectAddressFormat(addr.address)
                const displayLabel = addr.label || detected.chainType?.toUpperCase() || ''
                return (
                  <div 
                    key={i}
                    className="bg-muted/50 flex items-center gap-3 rounded-lg p-3"
                  >
                    <Wallet className="text-muted-foreground size-5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      {displayLabel && (
                        <div className="text-muted-foreground text-xs">
                          {displayLabel}
                        </div>
                      )}
                      <div className="truncate font-mono text-sm">
                        {addr.address}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Memo */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm">
              {t('addressBook.memo')}
            </label>
            <Input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t('addressBook.memoPlaceholder')}
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || saved}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || addresses.length === 0 || isSaving || saved}
            className={cn('flex-1', saved && 'bg-green-500')}
          >
            {saved ? (
              <>
                <Check className="mr-1 size-4" />
                {t('saved')}
              </>
            ) : isSaving ? (
              t('saving')
            ) : (
              t('save')
            )}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export const ContactAddConfirmJob: ActivityComponentType<ContactAddConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ContactAddConfirmJobContent />
    </ActivityParamsProvider>
  )
}

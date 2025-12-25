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
  IconUser as User,
  IconWallet as Wallet,
  IconCheck as Check,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { addressBookActions, type ChainType } from '@/stores'
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
  chainType: ChainType
  address: string
  label?: string
}

const CHAIN_NAMES: Record<string, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
}

function ContactAddConfirmJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const params = useActivityParams<ContactAddConfirmJobParams>()
  
  const [name, setName] = useState(params.name || '')
  const [memo, setMemo] = useState(params.memo || '')
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
  
  const handleSave = useCallback(async () => {
    if (!name.trim() || addresses.length === 0) return
    
    setIsSaving(true)
    try {
      // 添加联系人
      addressBookActions.addContact({
        name: name.trim(),
        addresses: addresses.map((a, i) => ({
          id: `addr-${i}`,
          address: a.address,
          chainType: a.chainType,
          label: a.label,
          isDefault: i === 0,
        })),
        memo: memo.trim() || undefined,
        avatar: params.avatar,
      })
      
      setSaved(true)
      setTimeout(() => pop(), 500)
    } catch (err) {
      console.error('[ContactAddConfirmJob] Save error:', err)
    } finally {
      setIsSaving(false)
    }
  }, [name, memo, addresses, params.avatar, pop])
  
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
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              {params.avatar ? (
                <span className="text-2xl">{params.avatar}</span>
              ) : (
                <User className="text-primary size-6" />
              )}
            </div>
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
              {addresses.map((addr, i) => (
                <div 
                  key={i}
                  className="bg-muted/50 flex items-center gap-3 rounded-lg p-3"
                >
                  <Wallet className="text-muted-foreground size-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-muted-foreground text-xs">
                      {CHAIN_NAMES[addr.chainType] || addr.chainType}
                      {addr.label && ` · ${addr.label}`}
                    </div>
                    <div className="truncate font-mono text-sm">
                      {addr.address}
                    </div>
                  </div>
                </div>
              ))}
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

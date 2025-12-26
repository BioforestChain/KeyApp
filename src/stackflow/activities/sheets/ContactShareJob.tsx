/**
 * ContactShareJob - 分享联系人名片
 * 
 * 显示联系人二维码，让他人扫描添加
 */

import { useMemo } from 'react'
import type { ActivityComponentType } from '@stackflow/react'
import { BottomSheet } from '@/components/layout/bottom-sheet'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  IconUser as User,
  IconX as X,
  IconDownload as Download,
  IconShare as Share,
} from '@tabler/icons-react'
import { QRCodeSVG } from 'qrcode.react'
import { generateContactQRContent, type ContactAddressInfo } from '@/lib/qr-parser'
import { useFlow } from '../../stackflow'
import { ActivityParamsProvider, useActivityParams } from '../../hooks'

/** Job 参数 */
export type ContactShareJobParams = {
  /** 联系人名称 */
  name: string
  /** 地址列表 JSON */
  addresses: string
  /** 备注 */
  memo?: string | undefined
  /** 头像 */
  avatar?: string | undefined
}

const CHAIN_NAMES: Record<string, string> = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
  tron: 'TRX',
}

function ContactShareJobContent() {
  const { t } = useTranslation('common')
  const { pop } = useFlow()
  const params = useActivityParams<ContactShareJobParams>()
  
  // 解析地址列表
  const addresses: ContactAddressInfo[] = useMemo(() => {
    try {
      return JSON.parse(params.addresses || '[]')
    } catch {
      return []
    }
  }, [params.addresses])
  
  // 生成二维码内容
  const qrContent = useMemo(() => {
    return generateContactQRContent({
      name: params.name,
      addresses,
      memo: params.memo,
      avatar: params.avatar,
    })
  }, [params.name, addresses, params.memo, params.avatar])
  
  // 下载二维码
  const handleDownload = () => {
    const svg = document.getElementById('contact-qr-code')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const link = document.createElement('a')
      link.download = `contact-${params.name}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }
  
  // 分享（如果支持 Web Share API）
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('addressBook.shareContact'),
          text: `${params.name} - ${addresses.map(a => `${CHAIN_NAMES[a.chainType] || a.chainType}: ${a.address}`).join(', ')}`,
        })
      } catch {
        // User cancelled or share failed
      }
    }
  }
  
  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 pb-4">
          <Button variant="ghost" size="icon" onClick={() => pop()}>
            <X className="size-5" />
          </Button>
          <h2 className="text-lg font-semibold">
            {t('addressBook.shareContact')}
          </h2>
          <div className="w-10" />
        </div>
        
        {/* Content */}
        <div className="flex flex-col items-center p-6">
          {/* Contact Info */}
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              {params.avatar ? (
                <span className="text-2xl">{params.avatar}</span>
              ) : (
                <User className="text-primary size-6" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{params.name}</h3>
              <p className="text-muted-foreground text-sm">
                {addresses.map(a => CHAIN_NAMES[a.chainType] || a.chainType).join(' · ')}
              </p>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="rounded-2xl bg-white p-4">
            <QRCodeSVG
              id="contact-qr-code"
              value={qrContent}
              size={200}
              level="M"
              includeMargin
            />
          </div>
          
          {/* Hint */}
          <p className="text-muted-foreground mt-4 text-center text-sm">
            {t('addressBook.scanToAdd')}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-4">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="mr-2 size-4" />
            {t('download')}
          </Button>
          {'share' in navigator && (
            <Button
              onClick={handleShare}
              className="flex-1"
            >
              <Share className="mr-2 size-4" />
              {t('share')}
            </Button>
          )}
        </div>
      </div>
    </BottomSheet>
  )
}

export const ContactShareJob: ActivityComponentType<ContactShareJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ContactShareJobContent />
    </ActivityParamsProvider>
  )
}

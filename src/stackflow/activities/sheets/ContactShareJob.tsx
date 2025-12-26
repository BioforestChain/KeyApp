/**
 * ContactShareJob - 分享联系人名片
 *
 * 显示联系人二维码，让他人扫描添加
 * 使用 snapdom 实现高质量的名片截图下载
 */

import { useMemo, useRef, useCallback, useState } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { IconX as X, IconDownload as Download, IconShare as Share, IconLoader2 as Loader } from '@tabler/icons-react';
import { generateContactQRContent, type ContactAddressInfo } from '@/lib/qr-parser';
import { ContactCard } from '@/components/contact/contact-card';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';

/** Job 参数 */
export type ContactShareJobParams = {
  /** 联系人名称 */
  name: string;
  /** 地址列表 JSON */
  addresses: string;
  /** 备注 */
  memo?: string | undefined;
  /** 头像 */
  avatar?: string | undefined;
};

const CHAIN_NAMES: Record<string, string> = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
  tron: 'TRX',
};

function ContactShareJobContent() {
  const { t } = useTranslation('common');
  const { pop } = useFlow();
  const params = useActivityParams<ContactShareJobParams>();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const addresses: ContactAddressInfo[] = useMemo(() => {
    try {
      return JSON.parse(params.addresses || '[]');
    } catch {
      return [];
    }
  }, [params.addresses]);

  const qrContent = useMemo(() => {
    return generateContactQRContent({
      name: params.name,
      addresses,
      avatar: params.avatar,
    });
  }, [params.name, addresses, params.avatar]);

  const handleDownload = useCallback(async () => {
    const cardElement = cardRef.current;
    if (!cardElement || isDownloading) return;

    setIsDownloading(true);
    try {
      const { snapdom } = await import('@zumer/snapdom');
      await snapdom.download(cardElement, {
        type: 'png',
        filename: `contact-${params.name}.png`,
        scale: 2,
        quality: 1,
      });
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [params.name, isDownloading]);

  const handleShare = useCallback(async () => {
    const cardElement = cardRef.current;
    if (!cardElement || !navigator.share) return;

    setIsDownloading(true);
    try {
      const { snapdom } = await import('@zumer/snapdom');
      const result = await snapdom(cardElement, { scale: 2 });
      const blob = await result.toBlob();
      const file = new File([blob], `contact-${params.name}.png`, { type: 'image/png' });

      await navigator.share({
        title: t('addressBook.shareContact'),
        text: `${params.name} - ${addresses.map((a) => `${CHAIN_NAMES[a.chainType] || a.chainType}: ${a.address}`).join(', ')}`,
        files: [file],
      });
    } catch {
      // User cancelled or share failed
    } finally {
      setIsDownloading(false);
    }
  }, [params.name, addresses, t, isDownloading]);

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        <div className="flex items-center justify-between border-b px-4 pb-4">
          <Button variant="ghost" size="icon" onClick={() => pop()}>
            <X className="size-5" />
          </Button>
          <h2 className="text-lg font-semibold">{t('addressBook.shareContact')}</h2>
          <div className="w-10" />
        </div>

        <div className="flex flex-col items-center p-6">
          <div ref={cardRef}>
            <ContactCard name={params.name} avatar={params.avatar} addresses={addresses} qrContent={qrContent} />
          </div>

          <p className="text-muted-foreground mt-4 text-center text-sm">{t('addressBook.scanToAdd')}</p>
        </div>

        <div className="flex gap-3 p-4">
          <Button variant="outline" onClick={handleDownload} disabled={isDownloading} className="flex-1">
            {isDownloading ? <Loader className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
            {t('download')}
          </Button>
          {'share' in navigator && (
            <Button onClick={handleShare} disabled={isDownloading} className="flex-1">
              {isDownloading ? <Loader className="mr-2 size-4 animate-spin" /> : <Share className="mr-2 size-4" />}
              {t('share')}
            </Button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

export const ContactShareJob: ActivityComponentType<ContactShareJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <ContactShareJobContent />
    </ActivityParamsProvider>
  );
};

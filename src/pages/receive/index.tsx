import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigation } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import { AddressDisplay } from '@/components/wallet/address-display';
import { AddressQRCode, Alert, GradientButton } from '@/components/common';
import { ChainIcon } from '@/components/wallet/chain-icon';
import { Button } from '@/components/ui/button';
import { useClipboard, useToast, useHaptics } from '@/services';
import {
  IconCopy as Copy,
  IconShare2 as Share2,
  IconCheck as Check,
  IconDownload as Download,
  IconLoader2 as Loader,
} from '@tabler/icons-react';
import { useCurrentChainAddress, useSelectedChain, type ChainType } from '@/stores';

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
};

export function ReceivePage() {
  const { t } = useTranslation('transaction');
  const { goBack } = useNavigation();
  const clipboard = useClipboard();
  const toast = useToast();
  const haptics = useHaptics();

  const chainAddress = useCurrentChainAddress();
  const selectedChain = useSelectedChain();
  const selectedChainName = CHAIN_NAMES[selectedChain] ?? selectedChain;
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const qrCardRef = useRef<HTMLDivElement>(null);

  const address = chainAddress?.address || '';

  const handleCopy = async () => {
    if (address) {
      await clipboard.write({ text: address });
      await haptics.impact('light');
      setCopied(true);
      toast.show(t('receivePage.addressCopied'));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = useCallback(async () => {
    const cardElement = qrCardRef.current;
    if (!cardElement || isProcessing) return;

    setIsProcessing(true);
    try {
      const { snapdom } = await import('@zumer/snapdom');
      await snapdom.download(cardElement, {
        type: 'png',
        filename: `receive-${selectedChain}-${address.slice(0, 8)}.png`,
        scale: 2,
        quality: 1,
      });
      await haptics.impact('success');
      toast.show(t('receivePage.imageSaved'));
    } catch {
      // Download failed silently
    } finally {
      setIsProcessing(false);
    }
  }, [address, selectedChain, isProcessing, haptics, toast, t]);

  const handleShare = useCallback(async () => {
    const cardElement = qrCardRef.current;
    if (!cardElement || isProcessing) return;

    setIsProcessing(true);
    try {
      if (navigator.share) {
        const { snapdom } = await import('@zumer/snapdom');
        const result = await snapdom(cardElement, { scale: 2 });
        const blob = await result.toBlob();
        const file = new File([blob], `receive-${selectedChain}.png`, { type: 'image/png' });

        await navigator.share({
          title: t('receivePage.shareTitle'),
          text: address,
          files: [file],
        });
        await haptics.impact('success');
      }
    } catch {
      // User cancelled share
    } finally {
      setIsProcessing(false);
    }
  }, [address, selectedChain, isProcessing, haptics, t]);

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('receivePage.title')} onBack={goBack} />

      <div className="flex-1 space-y-6 p-4">
        {/* Chain info */}
        <div className="text-muted-foreground flex items-center justify-center gap-2">
          <ChainIcon chain={selectedChain} size="sm" />
          <span className="text-sm">{selectedChainName}</span>
        </div>

        {/* QR code area - wrapped for screenshot */}
        <div ref={qrCardRef} className="bg-card flex flex-col items-center gap-4 rounded-2xl p-6 shadow-sm">
          <AddressQRCode
            address={address}
            chain={selectedChain}
            size={200}
            renderFn={({ value, size, level }) => (
              <QRCodeSVG value={value} size={size} level={level as 'L' | 'M' | 'Q' | 'H'} bgColor="#ffffff" fgColor="#000000" />
            )}
          />
          <p className="text-muted-foreground text-center text-sm">{t('receivePage.scanQrCode')}</p>
        </div>

        {/* Address display */}
        <div className="space-y-2">
          <label className="text-muted-foreground text-sm font-medium">{t('receivePage.receiveAddress')}</label>
          <div className="border-border bg-card rounded-xl border p-4">
            <AddressDisplay address={address} copyable />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" className="flex-1" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 size-4" />
                {t('receivePage.copied')}
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" />
                {t('receivePage.copyAddress')}
              </>
            )}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleDownload} disabled={isProcessing}>
            {isProcessing ? (
              <Loader className="mr-2 size-4 animate-spin" />
            ) : (
              <Download className="mr-2 size-4" />
            )}
            {t('receivePage.saveImage')}
          </Button>
        </div>

        {/* Share button - full width */}
        <GradientButton variant="mint" className="w-full" onClick={handleShare} disabled={isProcessing}>
          {isProcessing ? <Loader className="mr-2 size-4 animate-spin" /> : <Share2 className="mr-2 size-4" />}
          {t('receivePage.share')}
        </GradientButton>

        {/* Warning */}
        <Alert variant="info">{t('receivePage.networkWarning', { chain: selectedChainName })}</Alert>
      </div>
    </div>
  );
}

/**
 * ContactCard - 联系人名片卡片
 * 用于分享和展示联系人信息
 */

import { QRCodeSVG } from 'qrcode.react';
import { ContactAvatar } from '@/components/common/contact-avatar';
import { generateAvatarFromAddress } from '@/lib/avatar-codec';
import { detectAddressFormat } from '@/lib/address-format';
import type { ContactAddressInfo } from '@/lib/qr-parser';
import { isBioforestChain } from '@/lib/crypto';

/** Address format standard colors */
const ADDRESS_FORMAT_COLORS = {
  evm: '#627EEA',       // EVM (0x...) - ethereum, binance
  bitcoin: '#F7931A',   // Bitcoin (1.../3.../bc1...)
  tron: '#FF0013',      // TRON (T...)
  bioforest: '#6366F1', // BioForest (all BioForest chains share same format)
};

/** Get color based on address format standard */
function getAddressFormatColor(chainType: string | null): string {
  if (!chainType) return '#6B7280';

  // EVM-compatible chains
  if (chainType === 'ethereum' || chainType === 'binance') {
    return ADDRESS_FORMAT_COLORS.evm;
  }

  // Bitcoin
  if (chainType === 'bitcoin') {
    return ADDRESS_FORMAT_COLORS.bitcoin;
  }

  // TRON
  if (chainType === 'tron') {
    return ADDRESS_FORMAT_COLORS.tron;
  }

  // BioForest chains (all use same address format)
  if (isBioforestChain(chainType)) {
    return ADDRESS_FORMAT_COLORS.bioforest;
  }

  return '#6B7280';
}

/** 获取地址显示标签和颜色（只显示自定义 label） */
function getAddressDisplay(addr: ContactAddressInfo): { label: string; color: string } | null {
  if (!addr.label) return null;
  const detected = detectAddressFormat(addr.address);
  const color = getAddressFormatColor(detected.chainType);
  return { label: addr.label, color };
}

export interface ContactCardProps {
  name: string;
  avatar?: string | undefined;
  address?: string | undefined;
  addresses: ContactAddressInfo[];
  qrContent: string;
}

export function ContactCard({ name, avatar, address, addresses, qrContent }: ContactCardProps) {
  const effectiveAddress = address || addresses[0]?.address;
  const effectiveAvatar = avatar || (effectiveAddress ? generateAvatarFromAddress(effectiveAddress) : undefined);
  return (
    <div className="w-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-2xl">
      <div className="mb-6 flex items-center gap-4">
        <ContactAvatar src={effectiveAvatar} size={64} />
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {addresses.map((a, i) => {
              const display = getAddressDisplay(a);
              if (!display) return null;
              return (
                <span
                  key={i}
                  className="inline-flex max-w-[4rem] items-center truncate rounded-full px-2 py-0.5 text-xs font-medium text-white/90"
                  style={{ backgroundColor: display.color }}
                >
                  {display.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="rounded-2xl bg-white p-3 shadow-inner">
          <QRCodeSVG value={qrContent} size={180} level="M" bgColor="#FFFFFF" fgColor="#1E293B" />
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-slate-400">扫码添加联系人</p>
      </div>
    </div>
  );
}

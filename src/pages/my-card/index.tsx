/**
 * MyCardPage - 我的名片页面
 * 
 * 功能：
 * - 编辑用户名
 * - 点击头像随机生成新头像
 * - 选择最多 3 个钱包显示在名片上
 * - 使用 ContactCard 显示二维码
 * - snapdom 下载/分享
 */

import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import { ContactCard } from '@/components/contact/contact-card';
import { ContactAvatar } from '@/components/common/contact-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateContactQRContent, type ContactAddressInfo } from '@/lib/qr-parser';
import {
    useUserProfile,
    userProfileActions,
    useWallets,
    useChainPreferences,
    type Wallet,
    type ChainType,
} from '@/stores';
import {
    IconDownload as Download,
    IconShare as Share,
    IconLoader2 as Loader,
    IconPlus as Plus,
    IconPencil as Pencil,
} from '@tabler/icons-react';
import { WalletPickerSheet } from './wallet-picker-sheet';

const CHAIN_NAMES: Record<ChainType, string> = {
    ethereum: 'ETH',
    bitcoin: 'BTC',
    tron: 'TRX',
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

/** Generate HSL background color from wallet themeHue */
function getWalletColor(themeHue: number): string {
    // Use HSL with fixed saturation and lightness for vibrant colors
    return `hsl(${themeHue}, 65%, 55%)`;
}

/** Calculate text color for contrast against HSL background */
function getContrastTextColor(hue: number): string {
    // For HSL(hue, 65%, 55%), lightness is 55% which is relatively balanced
    // Most colors at this saturation/lightness work better with white text
    // except for very light yellows/greens (hue 50-90)
    const needsDarkText = hue >= 40 && hue <= 100;
    return needsDarkText ? '#000000' : '#FFFFFF';
}

export function MyCardPage() {
    const { t } = useTranslation(['common', 'settings']);
    const { goBack } = useNavigation();
    const cardRef = useRef<HTMLDivElement>(null);

    const profile = useUserProfile();
    const wallets = useWallets();
    const chainPreferences = useChainPreferences();

    const [isDownloading, setIsDownloading] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [usernameInput, setUsernameInput] = useState(profile.username);
    const [showWalletPicker, setShowWalletPicker] = useState(false);

    // Initialize default avatar if not set
    useEffect(() => {
        if (!profile.avatar && wallets.length > 0) {
            const firstAddress = wallets[0]?.chainAddresses[0]?.address;
            if (firstAddress) {
                userProfileActions.initializeDefaultAvatar(firstAddress);
            }
        }
    }, [profile.avatar, wallets]);

    // Auto-select first wallet if none selected
    useEffect(() => {
        if (profile.selectedWalletIds.length === 0 && wallets.length > 0) {
            const firstWallet = wallets[0];
            if (firstWallet) {
                userProfileActions.toggleWalletSelection(firstWallet.id);
            }
        }
    }, [profile.selectedWalletIds, wallets]);

    // Get selected wallets with their current chain addresses
    const selectedWalletsWithAddresses = useMemo(() => {
        return profile.selectedWalletIds
            .map(id => wallets.find(w => w.id === id))
            .filter((w): w is Wallet => !!w)
            .map(wallet => {
                const selectedChain = chainPreferences[wallet.id] || wallet.chain;
                const chainAddress = wallet.chainAddresses.find(ca => ca.chain === selectedChain);
                return {
                    wallet,
                    chain: selectedChain,
                    address: chainAddress?.address,
                };
            })
            .filter(item => item.address);
    }, [profile.selectedWalletIds, wallets, chainPreferences]);

    // Generate addresses for QR code
    const addresses: ContactAddressInfo[] = useMemo(() => {
        return selectedWalletsWithAddresses.map(({ wallet, chain, address }) => ({
            address: address!,
            label: `${wallet.name} (${CHAIN_NAMES[chain] || chain})`,
        }));
    }, [selectedWalletsWithAddresses]);

    // Generate QR content
    const qrContent = useMemo(() => {
        if (addresses.length === 0) return '';
        return generateContactQRContent({
            name: profile.username || t('myCard.defaultName'),
            addresses,
            avatar: profile.avatar,
        });
    }, [profile.username, profile.avatar, addresses, t]);

    // Handle avatar click - randomize
    const handleAvatarClick = useCallback(() => {
        userProfileActions.randomizeAvatar();
    }, []);

    // Handle username editing
    const handleUsernameClick = useCallback(() => {
        setUsernameInput(profile.username);
        setIsEditingUsername(true);
    }, [profile.username]);

    const handleUsernameSave = useCallback(() => {
        userProfileActions.setUsername(usernameInput);
        setIsEditingUsername(false);
    }, [usernameInput]);

    const handleUsernameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUsernameSave();
        } else if (e.key === 'Escape') {
            setIsEditingUsername(false);
        }
    }, [handleUsernameSave]);

    // Handle download
    const handleDownload = useCallback(async () => {
        const cardElement = cardRef.current;
        if (!cardElement || isDownloading || addresses.length === 0) return;

        setIsDownloading(true);
        try {
            const { snapdom } = await import('@zumer/snapdom');
            await snapdom.download(cardElement, {
                type: 'png',
                filename: `my-card-${Date.now()}.png`,
                scale: 2,
                quality: 1,
            });
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    }, [isDownloading, addresses.length]);

    // Handle share
    const handleShare = useCallback(async () => {
        const cardElement = cardRef.current;
        if (!cardElement || !navigator.share || addresses.length === 0) return;

        setIsDownloading(true);
        try {
            const { snapdom } = await import('@zumer/snapdom');
            const result = await snapdom(cardElement, { scale: 2 });
            const blob = await result.toBlob();
            const file = new File([blob], `my-card.png`, { type: 'image/png' });

            await navigator.share({
                title: t('myCard.title'),
                text: profile.username || t('myCard.defaultName'),
                files: [file],
            });
        } catch {
            // User cancelled or share failed
        } finally {
            setIsDownloading(false);
        }
    }, [addresses.length, profile.username, t]);

    const displayName = profile.username || t('myCard.defaultName');

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PageHeader title={t('myCard.title')} onBack={goBack} />

            <div className="flex flex-1 flex-col items-center p-6">
                {/* Avatar - clickable to randomize */}
                <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="group relative mb-4 cursor-pointer transition-transform hover:scale-105"
                    aria-label={t('myCard.changeAvatar')}
                >
                    <ContactAvatar src={profile.avatar} size={80} />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-xs text-white">{t('myCard.changeAvatar')}</span>
                    </div>
                </button>

                {/* Username - clickable to edit */}
                {isEditingUsername ? (
                    <div className="mb-6 flex items-center gap-2">
                        <Input
                            value={usernameInput}
                            onChange={(e) => setUsernameInput(e.target.value)}
                            onBlur={handleUsernameSave}
                            onKeyDown={handleUsernameKeyDown}
                            placeholder={t('myCard.usernamePlaceholder')}
                            className="w-48 text-center"
                            autoFocus
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleUsernameClick}
                        className="group mb-6 flex items-center gap-2 text-xl font-semibold"
                    >
                        <span>{displayName}</span>
                        <Pencil className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                )}

                {/* Business Card Preview */}
                {addresses.length > 0 ? (
                    <div ref={cardRef} className="mb-6">
                        <ContactCard
                            name={displayName}
                            avatar={profile.avatar}
                            addresses={addresses}
                            qrContent={qrContent}
                        />
                    </div>
                ) : (
                    <div className="mb-6 flex h-[300px] w-[320px] items-center justify-center rounded-3xl bg-muted">
                        <p className="text-muted-foreground">{t('myCard.noWalletsSelected')}</p>
                    </div>
                )}

                {/* Selected Wallets */}
                <div className="mb-6 w-full max-w-[320px]">
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                        {t('myCard.selectWallets')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedWalletsWithAddresses.map(({ wallet, chain }) => {
                            const bgColor = getWalletColor(wallet.themeHue);
                            const textColor = getContrastTextColor(wallet.themeHue);
                            return (
                                <div
                                    key={wallet.id}
                                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium"
                                    style={{ backgroundColor: bgColor, color: textColor }}
                                >
                                    <span>{wallet.name}</span>
                                    <span style={{ opacity: 0.8 }}>({CHAIN_NAMES[chain] || chain})</span>
                                </div>
                            );
                        })}
                        {profile.selectedWalletIds.length < 3 && (
                            <button
                                type="button"
                                onClick={() => setShowWalletPicker(true)}
                                className="flex items-center gap-1 rounded-full border border-dashed border-muted-foreground/50 px-3 py-1 text-sm text-muted-foreground hover:border-primary hover:text-primary"
                            >
                                <Plus className="size-3" />
                                {t('myCard.addWallet')}
                            </button>
                        )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {t('myCard.maxWallets', { max: 3 })}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full max-w-[320px] gap-3">
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                        disabled={isDownloading || addresses.length === 0}
                        className="flex-1"
                    >
                        {isDownloading ? (
                            <Loader className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 size-4" />
                        )}
                        {t('download')}
                    </Button>
                    {'share' in navigator && (
                        <Button
                            onClick={handleShare}
                            disabled={isDownloading || addresses.length === 0}
                            className="flex-1"
                        >
                            {isDownloading ? (
                                <Loader className="mr-2 size-4 animate-spin" />
                            ) : (
                                <Share className="mr-2 size-4" />
                            )}
                            {t('share')}
                        </Button>
                    )}
                </div>

                {/* Instruction */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    {t('myCard.scanToAdd')}
                </p>
            </div>

            {/* Wallet Picker Sheet */}
            <WalletPickerSheet
                open={showWalletPicker}
                onOpenChange={setShowWalletPicker}
            />
        </div>
    );
}

export default MyCardPage;
